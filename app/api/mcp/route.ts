import { createMcpHandler } from "mcp-handler";
import { tokenValido } from "@/lib/mcp/autenticacao";
import { INSTRUCOES, registrarFerramentas } from "@/lib/mcp/servidor";

/**
 * Servidor MCP do estoque: https://www.todecarrothe.com.br/api/mcp (Streamable HTTP, sem sessão).
 * Cliente: o agente de IA "Fco" da SendPulse, que atende no WhatsApp. Só leitura do catálogo público.
 *
 * Toda requisição precisa de `Authorization: Bearer <MCP_TOKEN>`; sem ele, 401 antes de chegar ao MCP.
 */

const mcp = createMcpHandler(registrarFerramentas, {
  serverInfo: { name: "todecarro-estoque", version: "1.0.0" },
  instructions: INSTRUCOES,
});

function naoAutorizado() {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32001, message: "Não autorizado." }, id: null },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="todecarro-mcp"', "Cache-Control": "no-store" } },
  );
}

async function handler(request: Request) {
  if (!tokenValido(request)) return naoAutorizado();
  const resposta = await mcp(request);
  // Estoque muda a qualquer momento: nenhuma resposta pode ficar em cache de CDN ou proxy.
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}

export { handler as GET, handler as POST, handler as DELETE };
