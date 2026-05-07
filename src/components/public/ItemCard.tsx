// src/components/public/ItemCard.tsx
// Public inventory card — no box location exposed

import Image from "next/image";
import Link from "next/link";
import { Tv2 } from "lucide-react";
import type { PublicInventoryItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface ItemCardProps {
  item: PublicInventoryItem;
}

export default function ItemCard({ item }: ItemCardProps) {
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
          <Image
            src={item.frontImage}
            alt={`${item.brand.name} ${item.modelNumber}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "contain", padding: "16px" }}
            loading="lazy"
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
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.brand.name}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.modelNumber}
              </p>
            </div>
          </div>

          {item.description && (
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
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
              fontSize: "12px",
              color: "var(--color-text-muted)",
            }}
          >
            Added {formatDate(item.createdAt)}
          </div>
        </div>
      </article>
    </Link>
  );
}
