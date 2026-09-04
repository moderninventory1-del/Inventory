// src/app/(admin)/admin/item/[id]/page.tsx
// Seamlessly redirects /admin/item/[id] to /admin/inventory/[id]

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminItemRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/inventory/${id}`);
}
