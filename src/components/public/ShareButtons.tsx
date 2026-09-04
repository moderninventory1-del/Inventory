"use client";
// src/components/public/ShareButtons.tsx
// WhatsApp sharing and copy link controls

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  id: string;
  brand: string;
  modelNumber: string;
  category: string;
}

export default function ShareButtons({ id, brand, modelNumber, category }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [itemUrl, setItemUrl] = useState("");

  useEffect(() => {
    // Generate full URL on the client to avoid SSR mismatch
    setItemUrl(`${window.location.origin}/item/${id}`);
  }, [id]);

  const handleShareWhatsApp = () => {
    if (!itemUrl) return;

    const message = `TV Spare Part Available

Brand: ${brand}
Model: ${modelNumber}
Category: ${category}

View Item:
${itemUrl}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = async () => {
    if (!itemUrl) return;

    try {
      await navigator.clipboard.writeText(itemUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
      <button
        onClick={handleShareWhatsApp}
        className="btn-primary"
        style={{
          flex: 1,
          background: "#25D366", // WhatsApp brand color
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        Share on WhatsApp
      </button>

      <button
        onClick={handleCopyLink}
        className="btn-secondary"
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          flexShrink: 0,
        }}
        title="Copy Link"
      >
        {copied ? <Check size={18} color="var(--color-success)" /> : <LinkIcon size={18} />}
        <span style={{ display: "none" }}>Copy Link</span>
      </button>
    </div>
  );
}
