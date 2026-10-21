import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demo } from "./dados";
import { Galeria } from "./galeria";

export const metadata: Metadata = { title: "Componentes", robots: { index: false, follow: false } };

export default function ComponentesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Galeria dados={demo} modo="demo" />;
}
