"use client";
// src/components/admin/InventoryForm.tsx
// Reusable form for adding/editing inventory items

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { DEFAULT_CATEGORIES } from "@/types";
import type { InventoryItem } from "@/types";
import type { ActionResult } from "@/app/actions/inventory";

import { createBrand, createCategory } from "@/app/actions/inventory";

interface InventoryFormProps {
  item?: InventoryItem;
  brands: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  action: (formData: FormData) => Promise<ActionResult | void>;
}

export default function InventoryForm({
  item,
  brands: initialBrands,
  categories: initialCategories,
  action,
}: InventoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState(initialBrands);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(item?.brandId ?? "");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    initialCategories && initialCategories.length > 0
      ? initialCategories
      : DEFAULT_CATEGORIES.map((name) => ({ id: name, name }))
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [categoryId, setCategoryId] = useState(item?.category ?? "");
  const [lastEntry, setLastEntry] = useState<Record<string, string> | null>(null);
  const isEditing = !!item;

  useEffect(() => {
    if (!isEditing) {
      const saved = sessionStorage.getItem("inventory_last_entry");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLastEntry(parsed);
          if (parsed.brandId) setSelectedBrandId(parsed.brandId);
          if (parsed.category) setCategoryId(parsed.category);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [isEditing]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (!isEditing) {
        // Smart defaults: inject previous text values if left empty
        if (!formData.get("modelNumber") && lastEntry?.modelNumber) {
          formData.set("modelNumber", lastEntry.modelNumber);
        }
        if (!formData.get("boxLocation") && lastEntry?.boxLocation) {
          formData.set("boxLocation", lastEntry.boxLocation);
        }
        if (!formData.get("description") && lastEntry?.description) {
          formData.set("description", lastEntry.description);
        }

        // Save entry for the next item
        const entryToSave = {
          modelNumber: formData.get("modelNumber") as string,
          brandId: formData.get("brandId") as string,
          category: formData.get("category") as string,
          boxLocation: formData.get("boxLocation") as string,
          description: formData.get("description") as string,
        };
        sessionStorage.setItem("inventory_last_entry", JSON.stringify(entryToSave));
      }

      const result = await action(formData);

      // If action returns (not a redirect), check for errors
      if (result && !result.success) {
        toast.error(result.error);
        setIsSubmitting(false);
      }
      // Success with redirect is handled by the server action
    } catch (err) {
      // NEXT_REDIRECT throws and is expected — don't show error
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("NEXT_REDIRECT")) {
        toast.error("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    }
  }

  async function handleAddBrand() {
    if (!newBrandName.trim()) return;
    setIsSavingBrand(true);
    try {
      const res = await createBrand(newBrandName);
      if (res.success && res.brand) {
        setBrands((prev) => [...prev, res.brand].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedBrandId(res.brand.id);
        setIsAddingBrand(false);
        setNewBrandName("");
        toast.success("Brand added");
      } else if (!res.success) {
        toast.error(res.error || "Failed to add brand");
      }
    } catch {
      toast.error("Failed to add brand");
    } finally {
      setIsSavingBrand(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await createCategory(newCategoryName);
      if (res.success && res.category) {
        setCategories((prev) =>
          [...prev, res.category].sort((a, b) => a.name.localeCompare(b.name))
        );
        setCategoryId(res.category.name);
        setIsAddingCategory(false);
        setNewCategoryName("");
        toast.success("Category added");
      } else if (!res.success) {
        toast.error(res.error || "Failed to add category");
      }
    } catch {
      toast.error("Failed to add category");
    } finally {
      setIsSavingCategory(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Basic Info */}
      <section className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px", color: "var(--color-text-secondary)" }}>
          Item Details
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="brandId" className="input-label">
              Brand <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            
            {isAddingBrand ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="New brand name"
                  className="input-field"
                  disabled={isSavingBrand}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="btn-primary"
                  disabled={isSavingBrand || !newBrandName.trim()}
                  style={{ padding: "8px 12px" }}
                >
                  {isSavingBrand ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBrand(false);
                    setNewBrandName("");
                  }}
                  className="btn-secondary"
                  disabled={isSavingBrand}
                  style={{ padding: "8px 12px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  id="brandId"
                  name="brandId"
                  className="input-field"
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select brand…</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(true)}
                  className="btn-secondary"
                  style={{ flexShrink: 0, padding: "8px 12px", fontSize: "12px" }}
                  title="Add New Brand"
                >
                  + New
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="modelNumber" className="input-label">
              Model Number <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="modelNumber"
              name="modelNumber"
              type="text"
              className="input-field"
              placeholder={!isEditing && lastEntry?.modelNumber ? `Leave empty to use: ${lastEntry.modelNumber}` : "e.g. UA55NU7100"}
              defaultValue={item?.modelNumber ?? ""}
              required={isEditing || !lastEntry?.modelNumber}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="category" className="input-label">
              Category <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>

            {isAddingCategory ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="input-field"
                  disabled={isSavingCategory}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="btn-primary"
                  disabled={isSavingCategory || !newCategoryName.trim()}
                  style={{ padding: "8px 12px" }}
                >
                  {isSavingCategory ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="btn-secondary"
                  disabled={isSavingCategory}
                  style={{ padding: "8px 12px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  id="category"
                  name="category"
                  className="input-field"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="btn-secondary"
                  style={{ flexShrink: 0, padding: "8px 12px", fontSize: "12px" }}
                  title="Add New Category"
                >
                  + New
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="boxLocation" className="input-label">
              Box Location
            </label>
            <input
              id="boxLocation"
              name="boxLocation"
              type="text"
              className="input-field"
              placeholder={!isEditing && lastEntry?.boxLocation ? `Leave empty to use: ${lastEntry.boxLocation}` : "e.g. Shelf A3, Box 12"}
              defaultValue={item?.boxLocation ?? ""}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="input-field"
            placeholder={!isEditing && lastEntry?.description ? `Leave empty to use: ${lastEntry.description}` : "Condition, defects, notes…"}
            defaultValue={item?.description ?? ""}
            disabled={isSubmitting}
            rows={4}
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
        </div>
      </section>

      {/* Images */}
      <section className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px", color: "var(--color-text-secondary)" }}>
          Images
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <ImageUpload
            label="Front Image"
            fieldName="frontImageDataUri"
            existingUrl={item?.frontImage}
            required={!isEditing}
          />
          <ImageUpload
            label="Back Image (optional)"
            fieldName="backImageDataUri"
            existingUrl={item?.backImage ?? undefined}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="form-actions-row">
        <button
          type="submit"
          className="btn-primary form-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {isEditing ? "Saving…" : "Adding…"}
            </>
          ) : (
            <>
              <Save size={15} />
              {isEditing ? "Save Changes" : "Add Item"}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary form-cancel-btn"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>

      <style>{`
        .form-actions-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 8px;
          padding-bottom: calc(56px + env(safe-area-inset-bottom, 20px));
        }

        .form-submit-btn {
          min-width: 150px;
          height: 44px;
          font-weight: 600;
        }

        .form-cancel-btn {
          height: 44px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .form-actions-row {
            flex-direction: column;
            width: 100%;
          }
          .form-submit-btn,
          .form-cancel-btn {
            width: 100%;
            justify-content: center;
            height: 48px;
            font-size: 15px;
          }
        }
      `}</style>
    </form>
  );
}
