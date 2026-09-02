"use client";
// src/components/admin/ImageUpload.tsx
// Drag-and-drop image upload with preview

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { compressImageClient } from "@/lib/imageCompression";

interface ImageUploadProps {
  label: string;
  fieldName: string;
  existingUrl?: string | null;
  required?: boolean;
}

export default function ImageUpload({
  label,
  fieldName,
  existingUrl,
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [dataUri, setDataUri] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    // Prevent absurdly huge files from crashing the browser, but 5MB is no longer a strict limit
    if (file.size > 20 * 1024 * 1024) {
      alert("Image is too large to process (max 20MB). Please select a smaller image.");
      return;
    }

    setIsCompressing(true);
    try {
      // Create a temporary object URL for immediate preview (feels fast)
      const tempPreview = URL.createObjectURL(file);
      setPreview(tempPreview);

      // Compress to JPEG format with max 2048px dimension and 95% quality (WhatsApp HD mode equivalent)
      const compressedDataUri = await compressImageClient(file, {
        maxWidthOrHeight: 2048,
        quality: 0.95,
      });

      setPreview(compressedDataUri);
      setDataUri(compressedDataUri);
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Failed to compress image. Please try another one.");
      handleRemove();
    } finally {
      setIsCompressing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  function handleRemove() {
    setPreview(null);
    setDataUri("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="input-label" style={{ marginBottom: "8px", display: "block" }}>
        {label}
        {required && <span style={{ color: "var(--color-danger)", marginLeft: "3px" }}>*</span>}
      </label>

      {/* Hidden data URI field — sent to server action */}
      <input type="hidden" name={fieldName} value={dataUri} />

      {preview ? (
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            aspectRatio: "16/10",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-surface)",
          }}
        >
          <Image
            src={preview}
            alt="Preview"
            fill
            style={{ objectFit: "contain", opacity: isCompressing ? 0.5 : 1, transition: "opacity var(--transition-fast)" }}
            unoptimized={preview.startsWith("data:") || preview.startsWith("blob:")}
          />
          
          {/* Compressing indicator overlay */}
          {isCompressing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
<<<<<<< HEAD
                background: "rgba(0,0,0,0.35)",
=======
                background: "rgba(0,0,0,0.4)",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
                color: "white",
                zIndex: 10,
                gap: "8px",
              }}
            >
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Compressing...</span>
            </div>
          )}

          {/* Actions overlay */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
<<<<<<< HEAD
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
=======
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
                borderRadius: "6px",
                padding: "6px",
                cursor: "pointer",
                color: "#fff",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Change image"
            >
              <Upload size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              style={{
<<<<<<< HEAD
                background: "rgba(255, 59, 48, 0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
=======
                background: "rgba(239, 68, 68, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
                borderRadius: "6px",
                padding: "6px",
                cursor: "pointer",
                color: "#fff",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            aspectRatio: "16/10",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            background: isDragging ? "var(--color-accent-glow)" : "var(--color-bg-surface)",
            transition: "all var(--transition-fast)",
            color: "var(--color-text-muted)",
          }}
        >
          <ImagePlus size={28} strokeWidth={1.5} />
          <p style={{ fontSize: "14px", fontWeight: 500 }}>
            Drop image here or <span style={{ color: "var(--color-accent-text)" }}>browse</span>
          </p>
          <p style={{ fontSize: "12px", textAlign: "center", padding: "0 12px" }}>
            Large images will be automatically compressed.<br />
            Optimized for fast uploads.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
