"use client";
// src/components/admin/InventoryForm.tsx
// Reusable form for adding/editing inventory items

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save, Tv2, Tag, Plus, Package } from "lucide-react";
import ImageUpload from "./ImageUpload";
import IOSSelect from "./IOSSelect";
import { DEFAULT_CATEGORIES } from "@/types";
import type { InventoryItem } from "@/types";
import type { ActionResult } from "@/app/actions/inventory";

import { createBrand, createCategory } from "@/app/actions/inventory";
import { clearAllInventoryCaches } from "@/lib/scroll-cache";

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
  const [boxLocationValue, setBoxLocationValue] = useState(item?.boxLocation ?? "");
  const [brandBoxes, setBrandBoxes] = useState<{ key: string; name: string }[]>([]);
  const [lastEntry, setLastEntry] = useState<Record<string, string> | null>(null);
  const isEditing = !!item;

  // Load existing boxes for the selected brand to offer quick box suggestions
  useEffect(() => {
    if (!selectedBrandId) {
      setBrandBoxes([]);
      return;
    }
    let active = true;
    fetch(`/api/admin/boxes?brandId=${encodeURIComponent(selectedBrandId)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setBrandBoxes(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedBrandId]);

  useEffect(() => {
    if (!isEditing) {
      const saved = sessionStorage.getItem("inventory_last_entry");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLastEntry(parsed);
          if (parsed.brandId) setSelectedBrandId(parsed.brandId);
          if (parsed.category) setCategoryId(parsed.category);
          if (parsed.boxLocation) setBoxLocationValue(parsed.boxLocation);
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
      // Clear scroll cache so newly created or edited items immediately reflect without stale cache
      clearAllInventoryCaches();

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
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--color-text-primary)", letterSpacing: "-0.015em" }}>
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
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <IOSSelect
                    id="brandId"
                    name="brandId"
                    label="Brand"
                    placeholder="Select brand…"
                    options={brands.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    }))}
                    value={selectedBrandId}
                    onChange={(val) => setSelectedBrandId(val)}
                    required
                    disabled={isSubmitting}
                    icon={<Tv2 size={16} />}
                    onAddNew={() => setIsAddingBrand(true)}
                    addNewLabel="+ Add New Brand"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(true)}
                  className="btn-secondary"
                  style={{
                    flexShrink: 0,
                    height: "42px",
                    padding: "0 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Add New Brand"
                >
                  <Plus size={14} />
                  <span>New</span>
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
              style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "-0.01em" }}
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
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <IOSSelect
                    id="category"
                    name="category"
                    label="Category"
                    placeholder="Select category…"
                    options={categories.map((cat) => ({
                      value: cat.name,
                      label: cat.name,
                    }))}
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    required
                    disabled={isSubmitting}
                    icon={<Tag size={16} />}
                    onAddNew={() => setIsAddingCategory(true)}
                    addNewLabel="+ Add New Category"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="btn-secondary"
                  style={{
                    flexShrink: 0,
                    height: "42px",
                    padding: "0 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Add New Category"
                >
                  <Plus size={14} />
                  <span>New</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label htmlFor="boxLocation" className="input-label" style={{ marginBottom: 0 }}>
                Box Location
              </label>
              {brandBoxes.length > 0 && (
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                  {brandBoxes.length} {brandBoxes.length === 1 ? "existing box" : "existing boxes"}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                id="boxLocation"
                name="boxLocation"
                type="text"
                className="input-field"
                placeholder={!isEditing && lastEntry?.boxLocation ? `Leave empty to use: ${lastEntry.boxLocation}` : "e.g. Shelf A3, Box 12"}
                value={boxLocationValue}
                onChange={(e) => setBoxLocationValue(e.target.value)}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
              {brandBoxes.length > 0 && (
                <div style={{ width: "160px", flexShrink: 0 }}>
                  <IOSSelect
                    name="_boxLocationHelper"
                    label="Box"
                    placeholder="Pick box…"
                    options={brandBoxes.map((b) => ({ value: b.name, label: b.name }))}
                    value={brandBoxes.some((b) => b.name === boxLocationValue) ? boxLocationValue : ""}
                    onChange={(val) => setBoxLocationValue(val)}
                    disabled={isSubmitting}
                    icon={<Package size={14} />}
                  />
                </div>
              )}
            </div>
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
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--color-text-primary)", letterSpacing: "-0.015em" }}>
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
