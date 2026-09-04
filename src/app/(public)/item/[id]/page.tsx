// src/app/(public)/item/[id]/page.tsx
// Redesigned Apple-inspired premium public item detail page for TV spare parts

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Tv2,
  Calendar,
  Tag,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Share2,
  FileText,
  Cpu,
  Layers,
  ExternalLink,
} from "lucide-react";
import ItemPhotoGallery from "@/components/public/ItemPhotoGallery";
import ShareButtons from "@/components/public/ShareButtons";
import BackButton from "@/components/shared/BackButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id, isDeleted: false },
    select: {
      brand: { select: { name: true } },
      modelNumber: true,
      category: true,
      frontImage: true,
    },
  });

  if (!item) return { title: "Spare Part Not Found | Modern Electronics" };

  return {
    title: `${item.brand.name} ${item.modelNumber} — ${item.category} | Modern Electronics`,
    description: `Check availability for ${item.brand.name} ${item.modelNumber} (${item.category}). Genuine TV spare parts at Modern Electronics, Chandigarh.`,
    openGraph: {
      title: `${item.brand.name} ${item.modelNumber} — ${item.category}`,
      description: `TV Spare Part: ${item.brand.name} ${item.modelNumber}. Contact Modern Electronics Chandigarh for price and availability.`,
      images: [
        {
          url: item.frontImage,
          width: 1200,
          height: 630,
          alt: `${item.brand.name} ${item.modelNumber}`,
        },
      ],
    },
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      modelNumber: true,
      brand: { select: { id: true, name: true } },
      category: true,
      description: true,
      frontImage: true,
      backImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!item) notFound();

  return (
    <div className="public-detail-wrapper">
      <div className="page-container" style={{ paddingTop: "20px", paddingBottom: "64px" }}>
        {/* ── 1. Top Navigation & Breadcrumb Bar ── */}
        <nav className="detail-top-nav" aria-label="Breadcrumb">
          <BackButton
            fallbackHref="/"
            label="All Spare Parts"
            className="nav-back-button"
            title="Return to spare parts list"
          />

          <div className="nav-breadcrumbs">
            <Link href="/" className="crumb-link">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href={`/?brand=${encodeURIComponent(item.brand.name)}`} className="crumb-link">
              {item.brand.name}
            </Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{item.modelNumber}</span>
          </div>
        </nav>

        {/* ── 2. Main 2-Column Split Grid ── */}
        <div className="public-detail-grid">
          {/* Left Column: High-Resolution Photo Viewer */}
          <div className="detail-gallery-column">
            <div className="gallery-sticky-wrapper">
              <ItemPhotoGallery
                frontImage={item.frontImage}
                backImage={item.backImage}
                altText={`${item.brand.name} ${item.modelNumber}`}
                brandName={item.brand.name}
                modelNumber={item.modelNumber}
                category={item.category}
              />
              
              <div className="gallery-hint">
                <Layers size={14} />
                <span>Tap either photo to open full-screen zoom & circuit inspector</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Specs & WhatsApp Contact */}
          <div className="detail-info-column">
            {/* Header Hero Card */}
            <div className="card public-hero-card">
              <div className="hero-status-row">
                <span className="badge badge-accent category-badge">
                  <Cpu size={12} strokeWidth={2.4} />
                  {item.category}
                </span>

                <div className="stock-pill">
                  <span className="stock-pulse-dot" />
                  <span>Available in Store</span>
                </div>
              </div>

              <h1 className="hero-brand-name">{item.brand.name}</h1>

              <div className="model-number-display">
                <span className="model-tag-label">Model No.</span>
                <span className="model-tag-value">{item.modelNumber}</span>
              </div>
            </div>

            {/* ── 3. Specifications Card (Apple Grouped List) ── */}
            <div className="card public-specs-card">
              <div className="specs-card-header">
                <h2 className="specs-section-title">Part Specifications</h2>
                <span className="verified-pill">
                  <ShieldCheck size={13} />
                  Tested & Verified
                </span>
              </div>

              <div className="specs-list">
                <SpecItem
                  icon={<Tag size={15} />}
                  label="Category"
                  value={item.category}
                />
                <SpecItem
                  icon={<Tv2 size={15} />}
                  label="Brand"
                  value={item.brand.name}
                />
                <SpecItem
                  icon={<Cpu size={15} />}
                  label="Model Number"
                  value={item.modelNumber}
                  isHighlight
                />
                <SpecItem
                  icon={<CheckCircle2 size={15} />}
                  label="Quality Check"
                  value="100% Genuine Board"
                  isAccent
                />
                <SpecItem
                  icon={<Calendar size={15} />}
                  label="Cataloged"
                  value={formatDate(item.createdAt)}
                />
              </div>
            </div>

            {/* ── 4. Technical Notes / Description (if provided) ── */}
            {item.description && (
              <div className="card public-description-card">
                <div className="description-title-row">
                  <FileText size={16} color="var(--color-accent)" />
                  <h2 className="specs-section-title">Technician Notes & Description</h2>
                </div>
                <p className="description-text">{item.description}</p>
              </div>
            )}

            {/* ── 5. Inquire & Purchase Action Card ── */}
            <div className="card public-contact-card">
              <div className="contact-card-badge">
                <MessageCircle size={15} strokeWidth={2.4} />
                <span>Instant Inquiry & Pricing</span>
              </div>

              <h3 className="contact-heading">Need this spare part?</h3>
              <p className="contact-subheading">
                Contact our technicians directly via WhatsApp with this board&apos;s details to confirm pricing, compatibility, and reserve it.
              </p>

              <ShareButtons
                id={item.id}
                brand={item.brand.name}
                modelNumber={item.modelNumber}
                category={item.category}
              />

              <a
                href="https://maps.app.goo.gl/WFVLkreNKd58rPsV8"
                target="_blank"
                rel="noopener noreferrer"
                className="store-location-badge"
                title="View Modern Electronics on Google Maps"
              >
                <MapPin size={14} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>Modern Electronics — 1590/1, Sector 45B, Burail, Chandigarh</span>
                <ExternalLink size={12} style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.7 }} />
              </a>
            </div>

            {/* ── 6. Customer Confidence Badges ── */}
            <div className="trust-grid">
              <div className="trust-item">
                <ShieldCheck size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <div>
                  <h4>Genuine Hardware</h4>
                  <p>Pre-tested authentic spare parts</p>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/WFVLkreNKd58rPsV8"
                target="_blank"
                rel="noopener noreferrer"
                className="trust-item store-pickup-btn"
                title="Open Store Location in Google Maps"
              >
                <MapPin size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4>Store Pickup</h4>
                    <ExternalLink size={12} color="var(--color-accent)" />
                  </div>
                  <p>Get Directions on Google Maps</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .public-detail-wrapper {
          width: 100%;
        }

        /* Nav Bar */
        .detail-top-nav {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .nav-back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 160ms ease;
        }
        .nav-back-button:hover {
          background: var(--color-bg-surface);
          border-color: rgba(0, 113, 227, 0.3);
          color: var(--color-accent);
          transform: translateX(-2px);
        }
        .nav-breadcrumbs {
          display: none;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted);
        }
        .crumb-link {
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .crumb-link:hover {
          color: var(--color-accent);
        }
        .crumb-sep {
          color: var(--color-border);
        }
        .crumb-current {
          color: var(--color-text-primary);
          font-weight: 700;
          font-family: var(--font-mono);
        }

        /* 2-Column Split Grid */
        .public-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .detail-gallery-column {
          width: 100%;
        }
        .gallery-sticky-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .gallery-hint {
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-muted);
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 100px;
          text-align: center;
        }
        .detail-info-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Hero Card */
        .public-hero-card {
          padding: 24px;
          border-radius: 20px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        .hero-status-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 100px;
        }
        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #28a745;
          background: rgba(40, 167, 69, 0.08);
          border: 1px solid rgba(40, 167, 69, 0.2);
          padding: 3px 10px;
          border-radius: 100px;
        }
        .stock-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #28a745;
          display: inline-block;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hero-brand-name {
          font-size: clamp(28px, 4.5vw, 38px);
          font-weight: 800;
          letter-spacing: -0.035em;
          color: var(--color-text-primary);
          line-height: 1.1;
          margin: 0 0 12px 0;
        }
        .model-number-display {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--color-bg-surface);
          border: 1.5px solid var(--color-border);
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .model-tag-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
        }
        .model-tag-value {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.015em;
          font-variant-numeric: tabular-nums;
        }

        /* Specs Card */
        .public-specs-card {
          padding: 22px;
          border-radius: 20px;
        }
        .specs-card-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 14px;
        }
        .specs-section-title {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin: 0;
        }
        .verified-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-accent);
          background: rgba(0, 113, 227, 0.08);
          padding: 3px 9px;
          border-radius: 100px;
        }
        .specs-list {
          display: flex;
          flex-direction: column;
        }
        .spec-row-item {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .spec-row-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .spec-row-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .spec-icon-wrapper {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justifyContent: center;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }
        .spec-icon-wrapper.accent {
          background: rgba(0, 113, 227, 0.1);
          border-color: rgba(0, 113, 227, 0.2);
          color: var(--color-accent);
        }
        .spec-row-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .spec-row-value {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .spec-row-value.highlight {
          font-family: var(--font-mono);
          color: var(--color-accent-text);
          font-weight: 800;
          font-size: 15px;
        }
        .spec-row-value.accent {
          color: #28a745;
          font-weight: 700;
        }

        /* Description */
        .public-description-card {
          padding: 22px;
          border-radius: 20px;
        }
        .description-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .description-text {
          font-size: 15px;
          color: var(--color-text-primary);
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
        }

        /* Contact Card */
        .public-contact-card {
          padding: 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(0, 113, 227, 0.06) 0%, rgba(0, 113, 227, 0.01) 100%);
          border: 1px solid rgba(0, 113, 227, 0.2);
          box-shadow: 0 4px 20px rgba(0, 113, 227, 0.05);
        }
        .contact-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-accent-text);
          background: rgba(0, 113, 227, 0.1);
          padding: 3px 10px;
          border-radius: 100px;
          margin-bottom: 12px;
        }
        .contact-heading {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
          margin: 0 0 6px 0;
        }
        .contact-subheading {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        .store-location-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(0, 113, 227, 0.12);
          font-size: 12px;
          color: var(--color-text-muted);
          line-height: 1.4;
          text-decoration: none;
          transition: color 150ms ease;
        }
        .store-location-badge:hover {
          color: var(--color-accent);
        }

        /* Trust Badges */
        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }
        .trust-item h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .trust-item p {
          font-size: 11px;
          color: var(--color-text-muted);
          margin: 2px 0 0 0;
        }

        .store-pickup-btn {
          text-decoration: none;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        .store-pickup-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 113, 227, 0.3);
          box-shadow: 0 4px 16px rgba(0, 113, 227, 0.08);
        }
        .store-pickup-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .trust-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 768px) {
          .nav-breadcrumbs {
            display: flex;
          }
          .public-detail-grid {
            grid-template-columns: 52fr 48fr;
            gap: 32px;
            align-items: start;
          }
          .gallery-sticky-wrapper {
            position: sticky;
            top: 24px;
          }
        }
      `}</style>
    </div>
  );
}

function SpecItem({
  icon,
  label,
  value,
  isHighlight = false,
  isAccent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isHighlight?: boolean;
  isAccent?: boolean;
}) {
  return (
    <div className="spec-row-item">
      <div className="spec-row-left">
        <div className={`spec-icon-wrapper ${isHighlight ? "accent" : ""}`}>{icon}</div>
        <span className="spec-row-label">{label}</span>
      </div>
      <span
        className={`spec-row-value ${isHighlight ? "highlight" : ""} ${isAccent ? "accent" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
