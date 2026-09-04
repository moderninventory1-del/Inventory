"use client";
// src/components/public/ItemCard.tsx
// Public inventory card — no box location exposed

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tv2 } from "lucide-react";
import type { PublicInventoryItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface ItemCardProps {
  item: PublicInventoryItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/item/${item.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="card"
        style={{
          overflow: "hidden",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
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
            }}
          >
            <span className="badge badge-accent">{item.category}</span>
          </div>
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
          </div>

          {item.description && (
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </p>
          )}

          <div
            style={{
              marginTop: "auto",
              paddingTop: "8px",
              borderTop: "1px solid var(--color-border)",
              fontSize: "11.5px",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Added {formatDate(item.createdAt)}
          </div>
        </div>
      </article>
    </Link>
  );
}
