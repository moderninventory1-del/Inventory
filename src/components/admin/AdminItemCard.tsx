"use client";
// src/components/admin/AdminItemCard.tsx
// Admin inventory card — includes box location and admin actions

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Tv2, ChevronDown, ChevronUp, Pencil, Trash2, RotateCcw, Loader2, Eye, MapPin } from "lucide-react";
import { deleteInventoryItem, restoreInventoryItem } from "@/app/actions/inventory";
import type { InventoryItem } from "@/types";
import { formatDate } from "@/lib/utils";
import SlideToDeleteModal from "@/components/admin/SlideToDeleteModal";

interface AdminItemCardProps {
  item: InventoryItem;
  showDeleted?: boolean;
}

export default function AdminItemCard({ item, showDeleted = false }: AdminItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localDeleted, setLocalDeleted] = useState(item.isDeleted);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  function handleDelete() {
    setIsDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteInventoryItem(item.id);
      if (result.success) {
        toast.success("Item moved to trash");
        setLocalDeleted(true);
        setIsDeleteModalOpen(false);
      } else {
        toast.error(result.error);
        setIsDeleteModalOpen(false);
      }
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreInventoryItem(item.id);
      if (result.success) {
        toast.success("Item restored. Opening edit page to update details…");
        setLocalDeleted(false);
        router.push(`/admin/inventory/${item.id}/edit`);
      } else {
        toast.error(result.error);
      }
    });
  }

  // If it's deleted and we are not explicitly showing deleted items, hide it or fade it
  const isHidden = localDeleted && !showDeleted;

  return (
    <article
      className="card"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        opacity: isHidden ? 0.4 : 1,
        transition: "opacity var(--transition-base), height var(--transition-base)",
        position: "relative",
      }}
    >
      {/* Clickable Image & Main Content Area */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* Image */}
        <div
          className="aspect-inventory"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--color-bg-surface)",
            flexShrink: 0,
          }}
        >
          {!imgLoaded && (
            <div
              className="skeleton"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            />
          )}
          <Image
            src={item.frontImage}
            alt={`${item.brand.name} ${item.modelNumber}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{
              objectFit: "contain",
              padding: "16px",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 240ms ease-out",
            }}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          {/* Category badge overlay */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <span className="badge badge-accent">{item.category}</span>
            {localDeleted && <span className="badge badge-danger">Deleted</span>}
          </div>
          
          {/* Quick Box Location Overlay (Visible on hover or always in admin) */}
          {item.boxLocation && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                padding: "4px 8px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <MapPin size={12} />
              {item.boxLocation}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: "16px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div
              style={{
                flexShrink: 0,
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--color-bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-border)",
              }}
            >
              <Tv2 size={16} color="var(--color-accent-text)" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.brand.name}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.modelNumber}
              </p>
            </div>
            <div style={{ color: "var(--color-text-muted)" }}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Admin Panel */}
      {isExpanded && (
        <div
          style={{
            padding: "16px",
            background: "var(--color-bg-surface)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: "fade-in 0.2s ease-out forwards",
          }}
        >
          {/* Metadata Row */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-muted)" }}>
            <span>Added: {formatDate(item.createdAt)}</span>
            <span>ID: <span style={{ fontFamily: "monospace" }}>{item.id.slice(0, 8)}</span></span>
          </div>

          {/* Actions Row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {isPending ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-muted)", padding: "8px" }}>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </div>
            ) : localDeleted ? (
              <button
                onClick={handleRestore}
                className="btn-secondary"
                style={{ padding: "8px 12px", fontSize: "13px", flex: 1 }}
              >
                <RotateCcw size={14} />
                Restore Item
              </button>
            ) : (
              <>
                <Link
                  href={`/admin/inventory/${item.id}`}
                  className="btn-secondary"
                  style={{ padding: "8px", flex: 1, display: "flex", justifyContent: "center" }}
                  title="View Item Details"
                >
                  <Eye size={16} />
                </Link>
                <Link
                  href={`/admin/inventory/${item.id}/edit`}
                  className="btn-secondary"
                  style={{ padding: "8px", flex: 1, display: "flex", justifyContent: "center" }}
                  title="Edit Item"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                  style={{ padding: "8px", flex: 1, display: "flex", justifyContent: "center" }}
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Premium Slide-To-Delete Confirmation Modal */}
      <SlideToDeleteModal
        isOpen={isDeleteModalOpen}
        item={item}
        isDeleting={isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </article>
  );
}
