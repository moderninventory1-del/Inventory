"use client";
// src/components/admin/NotSureToggleButton.tsx
// Interactive toggle button on the Admin Item Detail Page to mark/unmark "Not Sure" state

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Clock } from "lucide-react";
import { toggleNotSureStatus } from "@/app/actions/inventory";
import { formatDateTime } from "@/lib/utils";
import SlideToNotSureModal from "./SlideToNotSureModal";
import toast from "react-hot-toast";

interface NotSureToggleButtonProps {
  id: string;
  isNotSureInitially?: boolean;
  initialRemarks?: string | null;
  initialNotSureAt?: Date | string | null;
  modelNumber: string;
  brand?: string;
  boxLocation?: string | null;
}

export default function NotSureToggleButton({
  id,
  isNotSureInitially = false,
  initialRemarks = null,
  initialNotSureAt = null,
  modelNumber,
  brand,
  boxLocation,
}: NotSureToggleButtonProps) {
  const [isNotSure, setIsNotSure] = useState(isNotSureInitially);
  const [currentRemarks, setCurrentRemarks] = useState(initialRemarks || "");
  const [notSureAt, setNotSureAt] = useState<Date | string | null>(initialNotSureAt || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Handle slide confirmation with remarks from the bottom sheet
  const handleSlideConfirm = async (remarks: string) => {
    setIsPending(true);
    try {
      const res = await toggleNotSureStatus(id, true, remarks);
      if (res.success) {
        setIsNotSure(true);
        setCurrentRemarks(remarks);
        setNotSureAt(new Date());
        setIsModalOpen(false);
        toast(
          `Marked ${modelNumber} as "Not Sure" with remarks. You will be prompted on next login to verify if it was sold.`,
          {
            icon: "⚠️",
            duration: 4500,
          }
        );
        return true;
      } else {
        toast.error(res.error || "Failed to update item status");
        return false;
      }
    } catch {
      toast.error("An error occurred while updating status");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  // Handle direct clear when already marked as Not Sure
  const handleClear = async () => {
    setIsPending(true);
    try {
      const res = await toggleNotSureStatus(id, false);
      if (res.success) {
        setIsNotSure(false);
        setCurrentRemarks("");
        setNotSureAt(null);
        toast.success(`Removed "Not Sure" tag from ${modelNumber}.`);
      } else {
        toast.error(res.error || "Failed to clear status");
      }
    } catch {
      toast.error("An error occurred while updating status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ width: "100%", marginTop: "12px" }}>
      {isNotSure ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "14px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1.5px solid rgba(245, 158, 11, 0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#b45309",
                    lineHeight: 1.2,
                  }}
                >
                  Marked as &quot;Not Sure&quot;
                </span>
                {notSureAt && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#92400e",
                      background: "rgba(245, 158, 11, 0.18)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      padding: "1px 6px",
                      borderRadius: "5px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Clock size={11} strokeWidth={2.4} />
                    <span>{formatDateTime(notSureAt)}</span>
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#92400e", display: "block", marginTop: "3px" }}>
                {currentRemarks
                  ? `Remarks: "${currentRemarks}"`
                  : "Staff was told the box number; status pending verification"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "#ffffff",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#b45309",
              fontSize: "12px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} color="#d97706" />
            )}
            <span>Clear Not Sure</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            width: "100%",
            padding: "9px 14px",
            borderRadius: "10px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            fontSize: "13px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          title="Mark this item as 'Not Sure' if staff asked for the box number and took it to check"
        >
          <AlertTriangle size={15} color="#f59e0b" />
          <span>Staff Checking Box? Mark as &quot;Not Sure&quot;</span>
        </button>
      )}

      {/* iOS Inspired Slide to Confirm Bottom Sheet Modal */}
      <SlideToNotSureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSlideConfirm}
        modelNumber={modelNumber}
        brand={brand}
        boxLocation={boxLocation}
      />
    </div>
  );
}
