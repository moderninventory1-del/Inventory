"use client";
// src/components/admin/AddCategoryButton.tsx
// Interactive modal to add and view categories from the admin panel

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Tag, X, Loader2 } from "lucide-react";
import { createCategory } from "@/app/actions/inventory";

interface AddCategoryButtonProps {
  initialCategories?: { id: string; name: string }[];
}

export default function AddCategoryButton({ initialCategories = [] }: AddCategoryButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createCategory(categoryName);
      if (res.success && res.category) {
        toast.success(`Category "${res.category.name}" added successfully!`);
        setCategories((prev) =>
          [...prev, res.category].sort((a, b) => a.name.localeCompare(b.name))
        );
        setCategoryName("");
        router.refresh();
      } else if (!res.success) {
        toast.error(res.error || "Failed to add category");
      }
    } catch {
      toast.error("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary"
        style={{
          fontSize: "13px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "var(--radius-sm)",
        }}
        title="Manage Categories"
      >
        <Tag size={14} color="var(--color-accent)" />
        <span>+ Category</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "28px",
              boxShadow: "var(--shadow-modal)",
              borderRadius: "var(--radius-lg)",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--color-accent-glow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tag size={18} color="var(--color-accent)" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Manage Categories
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                    Add categories for inventory classification
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. MAIN BOARD, T-CON, PANEL"
                className="input-field"
                style={{ flex: 1, height: "42px" }}
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !categoryName.trim()}
                style={{ padding: "0 18px", height: "42px", flexShrink: 0 }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </form>

            {/* Existing categories list */}
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Existing Categories ({categories.length})
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  maxHeight: "180px",
                  overflowY: "auto",
                  padding: "4px 0",
                }}
              >
                {categories.map((cat) => (
                  <span
                    key={cat.id || cat.name}
                    className="badge badge-accent"
                    style={{
                      fontSize: "12px",
                      padding: "5px 12px",
                      borderRadius: "100px",
                      fontWeight: 600,
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
