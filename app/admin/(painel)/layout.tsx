import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";

/** Menu lateral com o usuário e os contadores de novos (lê a sessão: fica dentro de <Suspense>). */
async function MenuLateral() {
  const { usuario } = await exigirAdmin();
  const contadores = await contarNovos();
  return (
    <div className="hidden lg:contents">
      <AdminSidebar contadores={contadores} usuario={usuario} />
    </div>
  );
}

/**
 * Moldura das páginas do painel: menu lateral de 248px no desktop (27–32); no mobile cada página traz
 * o próprio cabeçalho preto e a barra inferior (12, 16, 18), ou o rodapé de ações no detalhe (17, 19).
 */
export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:flex">
      <Suspense fallback={<div className="sticky top-0 hidden h-dvh w-248 flex-none bg-black lg:block" />}>
        <MenuLateral />
      </Suspense>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
