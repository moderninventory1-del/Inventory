// src/lib/imageCompression.ts

export async function compressImageClient(
  file: File,
  options: { maxWidthOrHeight?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidthOrHeight = 2048, quality = 0.95 } = options;

  return new Promise((resolve, reject) => {
    // We use object URL for faster loading instead of readAsDataURL
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // Clean up memory
      let width = img.width;
      let height = img.height;

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = Math.round((height * maxWidthOrHeight) / width);
          width = maxWidthOrHeight;
        } else {
          width = Math.round((width * maxWidthOrHeight) / height);
          height = maxWidthOrHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw the image, resizing it
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG for optimal size/quality ratio and universal browser support
      // (some older browsers fall back to uncompressed PNG if WebP is requested)
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };

    img.src = objectUrl;
  });
}
