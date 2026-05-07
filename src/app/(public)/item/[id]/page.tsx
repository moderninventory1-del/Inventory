// src/app/(public)/item/[id]/page.tsx
// Public item detail page — no box location

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { ArrowLeft, Tv2, Calendar, Tag } from "lucide-react";
import ShareButtons from "@/components/public/ShareButtons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id, isDeleted: false },
    select: { brand: { select: { name: true } }, modelNumber: true, category: true, frontImage: true },
  });

  if (!item) return { title: "Item Not Found" };

  return {
    title: `${item.brand.name} ${item.modelNumber} | ${item.category} TV`,
    description: `View details for ${item.brand.name} ${item.modelNumber} — ${item.category} TV available in our inventory.`,
    openGraph: {
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
      // boxLocation excluded
    },
  });

  if (!item) notFound();

  return (
    <div className="page-container" style={{ paddingTop: "32px", paddingBottom: "60px" }}>
      {/* Back link */}
      <Link
        href="/"
        className="btn-secondary"
        style={{ display: "inline-flex", marginBottom: "32px", fontSize: "13px" }}
      >
        <ArrowLeft size={15} />
        Back to inventory
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
        }}
        className="item-detail-grid"
      >
        {/* Images */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Front image */}
          <div
            className="card"
            style={{
              overflow: "hidden",
              position: "relative",
              aspectRatio: "16/10",
              background: "var(--color-bg-surface)",
            }}
          >
            <Image
              src={item.frontImage}
              alt={`${item.brand.name} ${item.modelNumber} — front`}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              style={{ objectFit: "contain", padding: "16px" }}
              priority
            />
            <div style={{ position: "absolute", top: "12px", left: "12px" }}>
              <span className="badge badge-accent">{item.category}</span>
            </div>
          </div>

          {/* Back image if available */}
          {item.backImage && (
            <div
              className="card"
              style={{
                overflow: "hidden",
                position: "relative",
                aspectRatio: "16/10",
                background: "var(--color-bg-surface)",
              }}
            >
              <Image
                src={item.backImage}
                alt={`${item.brand.name} ${item.modelNumber} — back`}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                style={{ objectFit: "contain", padding: "16px" }}
                loading="lazy"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              >
                Back view
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Tv2 size={22} color="var(--color-accent-text)" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "clamp(22px, 3vw, 30px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.1,
                  }}
                >
                  {item.brand.name}
                </h1>
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {item.modelNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div
            className="card"
            style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Specifications
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SpecRow icon={<Tag size={14} />} label="Category" value={item.category} />
              <SpecRow icon={<Tv2 size={14} />} label="Model Number" value={item.modelNumber} />
              <SpecRow icon={<Tv2 size={14} />} label="Brand" value={item.brand.name} />
              <SpecRow
                icon={<Calendar size={14} />}
                label="Added"
                value={formatDate(item.createdAt)}
              />
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="card" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                Description
              </h2>
              <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {item.description}
              </p>
            </div>
          )}

          {/* Contact CTA */}
          <div
            className="card"
            style={{
              padding: "20px",
              background: "var(--color-accent-glow)",
              borderColor: "rgba(99, 102, 241, 0.2)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "6px" }}>
              Interested in this TV?
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              Contact us to check availability and pricing.
            </p>

            <ShareButtons 
              id={item.id} 
              brand={item.brand.name} 
              modelNumber={item.modelNumber} 
              category={item.category} 
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .item-detail-grid {
            grid-template-columns: 55fr 45fr !important;
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: "13px", color: "var(--color-text-muted)", width: "100px", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}
