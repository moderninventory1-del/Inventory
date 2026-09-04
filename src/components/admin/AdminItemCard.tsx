"use client";
// src/components/admin/AdminItemCard.tsx
// Admin inventory card — includes box location and admin actions

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Tv2, ChevronDown, ChevronUp, Pencil, Trash2, RotateCcw, Loader2, Eye, MapPin } from "lucide-react";
import { deleteInventoryItem } from "@/app/actions/inventory";
import type { InventoryItem } from "@/types";
import { formatDate } from "@/lib/utils";
import SlideToDeleteModal from "@/components/admin/SlideToDeleteModal";
import SlideToRestoreModal from "@/components/admin/SlideToRestoreModal";
import { clearAllInventoryCaches } from "@/lib/scroll-cache";

interface AdminItemCardProps {
  item: InventoryItem;
  showDeleted?: boolean;
  onDelete?: (id: string) => void;
}

export default function AdminItemCard({ item, showDeleted = false, onDelete }: AdminItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localDeleted, setLocalDeleted] = useState(item.isDeleted);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
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
        clearAllInventoryCaches();
        onDelete?.(item.id);
      } else {
        toast.error(result.error);
        setIsDeleteModalOpen(false);
      }
    });
  }

  // If it's deleted and we are not explicitly showing deleted items, immediately remove from DOM
  const isHidden = localDeleted && !showDeleted;
  if (isHidden) {
    return null;
  }

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
              gap: "6px",
              zIndex: 2,
            }}
          >
            <span className="badge badge-accent">{item.category}</span>
            {item.isNotSure && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "100px",
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  color: "#92400e",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  boxShadow: "0 2px 6px rgba(245, 158, 11, 0.2)",
                }}
              >
                ⚠️ Not Sure
              </span>
            )}
            {localDeleted && <span className="badge badge-danger">Deleted</span>}
          </div>
          
          {/* Quick Box Location Overlay (Visible on hover or always in admin) */}
          {item.boxLocation && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(6px)",
                padding: "4px 9px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
              }}
            >
              <MapPin size={12} strokeWidth={2.4} />
              <span>{item.boxLocation}</span>
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
              <span
                style={{
                  display: "block",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  lineHeight: 1.2,
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.brand.name}
              </span>
              <h3
                style={{
                  fontSize: "15.5px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.015em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.modelNumber}
              </h3>
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
            <span>
              {item.isDeleted || localDeleted ? "Deleted: " : "Added: "}
              <strong
                style={{
                  fontWeight: 600,
                  color: item.isDeleted || localDeleted ? "var(--color-danger)" : "var(--color-text-secondary)",
                }}
              >
                {formatDate(
                  (item.isDeleted || localDeleted) && item.deletedAt
                    ? item.deletedAt
                    : item.createdAt
                )}
              </strong>
            </span>
            <span>ID: <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-secondary)" }}>{item.id.slice(0, 8)}</span></span>
          </div>

          {/* Actions Row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {isPending ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-muted)", padding: "8px" }}>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </div>
            ) : localDeleted ? (
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <Link
                  href={`/admin/inventory/${item.id}`}
                  className="btn-secondary"
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  title="View Item Details"
                >
                  <Eye size={15} />
                  <span>View Details</span>
                </Link>
                <button
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="btn-secondary"
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    color: "#16a34a",
                    borderColor: "rgba(34, 197, 94, 0.35)",
                    background: "rgba(34, 197, 94, 0.08)",
                  }}
                  title="Restore this item back to active inventory"
                >
                  <RotateCcw size={15} />
                  <span>Restore</span>
                </button>
              </div>
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

      {/* Premium Slide-To-Restore Confirmation Modal */}
      <SlideToRestoreModal
        isOpen={isRestoreModalOpen}
        item={item}
        onClose={() => setIsRestoreModalOpen(false)}
      />
    </article>
  );
}
