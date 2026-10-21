import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pior } from "../dados";
import { Galeria } from "../galeria";

export const metadata: Metadata = { title: "Componentes · pior caso", robots: { index: false, follow: false } };

export default function ComponentesPiorPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Galeria dados={pior} modo="pior" />;
}
