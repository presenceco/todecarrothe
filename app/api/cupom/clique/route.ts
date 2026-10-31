import { idDoCupomAtivo } from "@/lib/formularios/cupom-servidor";
import { dentroDoLimite, type Limite } from "@/lib/formularios/protecao";
import { resumoErro } from "@/lib/log";
import { clienteServico } from "@/lib/supabase/servico";

const LIMITE_CLIQUES: Limite = { quantidade: 60, janela: "1 hour" };
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Clique no "Tenho interesse" com cupom válido. É rota, e não Server Action, porque o navegador sai para o
 * WhatsApp logo em seguida: só o fetch com keepalive sobrevive a essa troca de página. Sem nenhum dado do
 * cliente. Acima do limite por IP, o clique só não é contado. Responde sempre 204, sem revelar nada do cupom.
 */
export async function POST(request: Request) {
  const fim = new Response(null, { status: 204 });
  try {
    const { slug, codigo } = (await request.json()) as { slug?: unknown; codigo?: unknown };
    if (typeof slug !== "string" || slug.length > 140 || !SLUG.test(slug)) return fim;
    if (!(await dentroDoLimite("cupom_clique", LIMITE_CLIQUES))) return fim;
    const cupomId = await idDoCupomAtivo(codigo);
    if (!cupomId) return fim;

    const servico = clienteServico();
    const { data: v } = await servico.from("veiculos").select("id, marca, modelo, versao").eq("slug", slug).maybeSingle();
    const { error } = await servico.from("cupom_cliques").insert({
      cupom_id: cupomId,
      veiculo_id: v?.id ?? null,
      veiculo_nome: v ? [v.marca, v.modelo, v.versao].filter(Boolean).join(" ") : null,
    });
    if (error) console.error("clique do cupom", resumoErro(error));
  } catch (e) {
    console.error("clique do cupom", resumoErro(e));
  }
  return fim;
}
