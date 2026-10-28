// src/app/(admin)/admin/item/[id]/edit/page.tsx
// Seamlessly redirects /admin/item/[id]/edit to /admin/inventory/[id]/edit

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminItemEditRedirectPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string") {
      query.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((v) => query.append(key, v));
    }
  }
  const queryString = query.toString();
  redirect(`/admin/inventory/${id}/edit${queryString ? `?${queryString}` : ""}`);
}
