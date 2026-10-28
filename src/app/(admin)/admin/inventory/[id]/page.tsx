// src/app/(admin)/admin/inventory/[id]/page.tsx
// Mobile-optimized, Apple-inspired Admin Item Detail View with special Box Location column

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Tv2,
  Calendar,
  Tag,
  Package,
  Pencil,
  ExternalLink,
  Clock,
  Fingerprint,
  FileText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import ItemPhotoGallery from "@/components/public/ItemPhotoGallery";
import AdminItemDetailHeader from "@/components/admin/AdminItemDetailHeader";
import AdminWhatsAppShare from "@/components/admin/AdminWhatsAppShare";
import NotSureToggleButton from "@/components/admin/NotSureToggleButton";
import AdminRestoreBanner from "@/components/admin/AdminRestoreBanner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      select: { brand: { select: { name: true } }, modelNumber: true },
    });

    if (!item) return { title: "Item Not Found | Admin" };

    return {
      title: `${item.brand.name} ${item.modelNumber} | Admin Details`,
    };
  } catch (err) {
    console.error("[Admin generateMetadata error]", err);
    return { title: "Item Details | Admin" };
  }
}

export const dynamic = "force-dynamic";

export default async function AdminItemDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;

  let item = null;
  try {
    item = await prisma.inventoryItem.findUnique({
      where: { id },
      select: {
        id: true,
        modelNumber: true,
        brand: { select: { id: true, name: true } },
        category: true,
        description: true,
        boxLocation: true,
        frontImage: true,
        backImage: true,
        isDeleted: true,
        isNotSure: true,
        notSureAt: true,
        notSureRemarks: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (err) {
    console.error(`[AdminItemDetailPage] Error fetching item ${id}:`, err);
  }

  if (!item) notFound();

  return (
    <div
      className="admin-detail-page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        paddingBottom: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── 1. Top Navigation Bar (Apple-styled with Edit, Delete with Slide Confirmation, and Back) ── */}
      <AdminItemDetailHeader item={item} />

      {/* ── Deleted Item Notice & One-Click Restore Banner ── */}
      {item.isDeleted && (
        <AdminRestoreBanner
          id={item.id}
          modelNumber={item.modelNumber}
          brandName={item.brand.name}
          category={item.category}
          boxLocation={item.boxLocation}
          frontImage={item.frontImage}
        />
      )}

      {/* ── 2. Main Content Grid ── */}
      <div className="admin-detail-grid">
        {/* Left Column: Photos Gallery with Pure Black Edge-Grasping Viewer */}
        <section className="detail-photos-section">
          <ItemPhotoGallery
            frontImage={item.frontImage}
            backImage={item.backImage}
            altText={`${item.brand.name} ${item.modelNumber}`}
            brandName={item.brand.name}
            modelNumber={item.modelNumber}
            category={item.category}
          />
        </section>

        {/* Right Column: Information Hierarchy & Special Box Number Card */}
        <section className="detail-info-section">
          {/* Header Card */}
          <div className="card identity-card">
            <div className="identity-header">
              <div className="brand-avatar">
                <Tv2 size={24} color="var(--color-accent)" />
              </div>
              <div className="identity-titles">
                <div className="identity-tags">
                  <span className="badge badge-accent">{item.category}</span>
                  {item.isDeleted && (
                    <span className="badge badge-danger">Deleted</span>
                  )}
                  <span className="verified-badge">
                    <ShieldCheck size={12} />
                    <span>Admin Verified</span>
                  </span>
                </div>
                <h1 className="item-title">{item.brand.name}</h1>
                <div className="model-pill">
                  <span className="model-label">Model</span>
                  <span className="model-value">{item.modelNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. SPECIAL HIGHLIGHT: Storage Box Number / Location Card ── */}
          <div className={`card box-highlight-card ${item.boxLocation ? "assigned" : "empty"}`}>
            <div className="box-card-top">
              <div className="box-tag-wrap">
                <div className="box-icon-bubble">
                  <Package size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <span className="box-badge-label">Storage Box Number</span>
                  <span className="box-status-dot">
                    <span className="pulse-dot" />
                    {item.boxLocation ? "Location Assigned" : "Not Assigned"}
                  </span>
                </div>
              </div>

              <Link
                href={`/admin/inventory/${item.id}/edit`}
                className="box-edit-link"
                title="Change or update storage box"
              >
                <span>{item.boxLocation ? "Change" : "Assign Box"}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="box-value-container">
              <span className="box-main-value">
                {item.boxLocation || "No Box Assigned"}
              </span>
            </div>

            {/* Single Premium WhatsApp Share Button with Box Prompt Modal */}
            <AdminWhatsAppShare
              id={item.id}
              brand={item.brand.name}
              modelNumber={item.modelNumber}
              category={item.category}
              boxLocation={item.boxLocation}
              description={item.description}
            />

            {/* Staff Checking Box Toggle Button */}
            <NotSureToggleButton
              id={item.id}
              isNotSureInitially={item.isNotSure}
              initialRemarks={item.notSureRemarks}
              initialNotSureAt={item.notSureAt}
              modelNumber={item.modelNumber}
              brand={item.brand.name}
              boxLocation={item.boxLocation}
            />
          </div>

          {/* ── 4. Item Specifications (Grouped Apple List) ── */}
          <div className="card specs-card">
            <h2 className="section-eyebrow">Specifications</h2>

            <div className="specs-table">
              <SpecRow
                icon={<Tag size={15} />}
                label="Category"
                value={item.category}
              />
              <SpecRow
                icon={<Tv2 size={15} />}
                label="Model Number"
                value={item.modelNumber}
              />
              <SpecRow
                icon={<Tv2 size={15} />}
                label="Brand"
                value={item.brand.name}
              />
              {/* Special Box Location in table */}
              <SpecRow
                icon={<Package size={15} />}
                label="Box Number"
                value={item.boxLocation || "Not Assigned"}
                isAccent={Boolean(item.boxLocation)}
              />
              <SpecRow
                icon={<Calendar size={15} />}
                label="Added On"
                value={formatDate(item.createdAt)}
              />
              <SpecRow
                icon={<Clock size={15} />}
                label="Last Modified"
                value={formatDate(item.updatedAt)}
              />
              <SpecRow
                icon={<Fingerprint size={15} />}
                label="Database ID"
                value={item.id}
                isMonospace
              />
            </div>
          </div>

          {/* ── 5. Description Card (if available) ── */}
          {item.description && (
            <div className="card description-card">
              <div className="description-header">
                <FileText size={15} color="var(--color-text-muted)" />
                <h2 className="section-eyebrow">Description & Notes</h2>
              </div>
              <p className="description-body">{item.description}</p>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .admin-detail-page-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 24px;
          margin: 0 auto;
          width: 100%;
        }

        /* Grid */
        .admin-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .detail-info-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Identity Header Card */
        .identity-card {
          padding: 18px 20px;
          border-radius: 18px;
        }
        .identity-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .brand-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }
        .identity-titles {
          min-width: 0;
          flex: 1;
        }
        .identity-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 6px;
        }
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-muted);
          background: rgba(0, 0, 0, 0.04);
          padding: 3px 8px;
          border-radius: 100px;
        }
        .item-title {
          font-size: clamp(24px, 4.5vw, 34px);
          font-weight: 800;
          letter-spacing: -0.035em;
          color: var(--color-text-primary);
          line-height: 1.15;
          margin: 0;
        }
        .model-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          background: var(--color-bg-surface);
          border: 1.5px solid var(--color-border);
          padding: 6px 14px;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }
        .model-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
        }
        .model-value {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.015em;
          font-variant-numeric: tabular-nums;
        }

        /* ── Special Box Location Card ── */
        .box-highlight-card {
          padding: 18px 20px;
          border-radius: 20px;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .box-highlight-card.assigned {
          background: linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(0, 113, 227, 0.02) 100%);
          border: 1px solid rgba(0, 113, 227, 0.24);
          box-shadow: 0 4px 20px rgba(0, 113, 227, 0.07);
        }
        .box-highlight-card.empty {
          background: var(--color-bg-surface);
          border: 1px dashed var(--color-border);
        }
        .box-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .box-tag-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .box-icon-bubble {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--color-accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(0, 113, 227, 0.28);
        }
        .box-highlight-card.empty .box-icon-bubble {
          background: rgba(0,0,0,0.08);
          color: var(--color-text-muted);
          box-shadow: none;
        }
        .box-badge-label {
          display: block;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent-text);
          line-height: 1.2;
        }
        .box-highlight-card.empty .box-badge-label {
          color: var(--color-text-muted);
        }
        .box-status-dot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34c759;
          display: inline-block;
        }
        .box-highlight-card.empty .pulse-dot {
          background: #ff9500;
        }
        .box-edit-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 100px;
          background: rgba(0, 113, 227, 0.1);
          color: var(--color-accent);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: background 150ms ease;
        }
        .box-edit-link:hover {
          background: rgba(0, 113, 227, 0.18);
        }
        .box-value-container {
          padding: 8px 0 2px;
        }
        .box-main-value {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--color-text-primary);
          line-height: 1.25;
          word-break: break-word;
        }
        .box-highlight-card.empty .box-main-value {
          color: var(--color-text-muted);
          font-weight: 600;
          font-size: 17px;
        }

        /* Specs Grouped Table */
        .specs-card {
          padding: 20px;
          border-radius: 20px;
        }
        .section-eyebrow {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin: 0 0 14px 0;
        }
        .specs-table {
          display: flex;
          flex-direction: column;
        }
        .spec-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .spec-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .spec-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex-shrink: 0;
        }
        .spec-icon-box {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }
        .spec-icon-box.accent {
          background: rgba(0, 113, 227, 0.1);
          border-color: rgba(0, 113, 227, 0.2);
          color: var(--color-accent);
        }
        .spec-label-text {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .spec-value-text {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 60%;
          font-variant-numeric: tabular-nums;
        }
        .spec-value-text.accent {
          color: var(--color-accent-text);
          font-weight: 800;
        }
        .spec-value-text.monospace {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        /* Description */
        .description-card {
          padding: 20px;
          border-radius: 20px;
        }
        .description-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .description-body {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin: 0;
          white-space: pre-wrap;
        }

        @media (max-width: 767px) {
          .admin-bottom-nav {
            display: none !important;
          }
          .scroll-to-top-btn.is-admin {
            bottom: max(24px, env(safe-area-inset-bottom, 24px)) !important;
          }
        }

        @media (min-width: 768px) {
          .admin-detail-grid {
            grid-template-columns: 52fr 48fr;
            gap: 28px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
  isAccent = false,
  isMonospace = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isAccent?: boolean;
  isMonospace?: boolean;
}) {
  return (
    <div className="spec-item-row">
      <div className="spec-item-left">
        <div className={`spec-icon-box ${isAccent ? "accent" : ""}`}>{icon}</div>
        <span className="spec-label-text">{label}</span>
      </div>
      <span className={`spec-value-text ${isAccent ? "accent" : ""} ${isMonospace ? "monospace" : ""}`}>
        {value}
      </span>
    </div>
  );
}
