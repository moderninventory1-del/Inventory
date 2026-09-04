// src/app/(admin)/admin/item/[id]/edit/page.tsx
// Seamlessly redirects /admin/item/[id]/edit to /admin/inventory/[id]/edit

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminItemEditRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/inventory/${id}/edit`);
}
