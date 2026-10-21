/** Junta classes, ignorando valores falsos. Os componentes não dependem de sobrescrever classes. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
