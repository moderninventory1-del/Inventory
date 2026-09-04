"use client";
// src/components/admin/AdminItemDetailHeader.tsx
// Premium Apple-inspired top navigation bar for Admin Item Detail page
// Features left-aligned back button, right-aligned actions (Public View, Delete with Slide Confirmation, Edit)

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { deleteInventoryItem } from "@/app/actions/inventory";
import { clearAllInventoryCaches } from "@/lib/scroll-cache";
import SlideToDeleteModal from "@/components/admin/SlideToDeleteModal";
import SlideToRestoreModal from "@/components/admin/SlideToRestoreModal";

interface AdminItemDetailHeaderProps {
  item: {
    id: string;
    modelNumber: string;
    brand: { name: string };
    category?: string;
    boxLocation?: string | null;
    frontImage?: string;
    isDeleted: boolean;
  };
}

export default function AdminItemDetailHeader({ item }: AdminItemDetailHeaderProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      router.push("/admin/inventory");
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInventoryItem(item.id);
      if (result.success) {
        toast.success(`Moved ${item.brand.name} ${item.modelNumber} to trash`, {
          icon: "🗑️",
          duration: 3500,
        });
        clearAllInventoryCaches();
        setIsDeleteModalOpen(false);
        router.push("/admin/inventory");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete item");
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    } catch {
      toast.error("Failed to delete item. Please try again.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "4px 0 12px",
          boxSizing: "border-box",
        }}
      >
        {/* ── Left Side: iOS Back Pill ── */}
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "100px",
            fontSize: "13.5px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "background 150ms ease, border-color 150ms ease, transform 120ms ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-bg-surface)";
            e.currentTarget.style.borderColor = "rgba(0, 113, 227, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-bg-card)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
          title="Back to Inventory"
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Inventory</span>
        </button>

        {/* ── Right Side: Grouped Actions (Public View, Delete, Edit) ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          {/* Public Storefront View Link (Only if not deleted) */}
          {!item.isDeleted ? (
            <Link
              href={`/item/${item.id}`}
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                transition: "all 150ms ease",
              }}
              title="Open storefront customer view in new tab"
            >
              <ExternalLink size={15} />
              <span className="admin-header-label-desktop">Public View</span>
            </Link>
          ) : (
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#ff3b30",
                background: "rgba(255, 59, 48, 0.1)",
                border: "1px solid rgba(255, 59, 48, 0.22)",
                padding: "6px 11px",
                borderRadius: "100px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="This item is currently deleted and hidden from public storefront"
            >
              <span>Deleted</span>
            </span>
          )}

          {/* Delete or Restore Action Button */}
          {!item.isDeleted ? (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 13px",
                background: "rgba(255, 59, 48, 0.08)",
                border: "1px solid rgba(255, 59, 48, 0.24)",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ff3b30",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(255, 59, 48, 0.06)",
                transition: "all 150ms ease",
              }}
              title="Delete this item (opens slide to confirm)"
            >
              <Trash2 size={14} strokeWidth={2.2} />
              <span className="admin-header-label-desktop">Delete</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRestoreModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 13px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.28)",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#16a34a",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(34, 197, 94, 0.08)",
                transition: "all 150ms ease",
              }}
              title="Restore this item to active inventory"
            >
              <RotateCcw size={14} strokeWidth={2.2} />
              <span className="admin-header-label-desktop">Restore</span>
            </button>
          )}

          {/* Edit Button (Always on the Right) */}
          <Link
            href={`/admin/inventory/${item.id}/edit`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              background: "var(--color-accent, #0071e3)",
              color: "#ffffff",
              border: "none",
              borderRadius: "100px",
              fontSize: "13.5px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(0, 113, 227, 0.28)",
              transition: "transform 120ms ease, box-shadow 150ms ease, background 150ms ease",
            }}
            title="Edit item specifications and photos"
          >
            <Pencil size={14} strokeWidth={2.4} />
            <span>Edit</span>
          </Link>
        </div>
      </header>

      {/* Slide to Delete Modal */}
      <SlideToDeleteModal
        isOpen={isDeleteModalOpen}
        item={item}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Slide to Restore Modal */}
      <SlideToRestoreModal
        isOpen={isRestoreModalOpen}
        item={item}
        onClose={() => setIsRestoreModalOpen(false)}
      />

      <style jsx>{`
        @media (max-width: 580px) {
          .admin-header-label-desktop {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
