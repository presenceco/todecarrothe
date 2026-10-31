/** Confetes em canvas nas cores da marca (azul, prata, branco e preto). Carregado só quando há comemoração. */
const CORES = ["#0045AA", "#C4C9D1", "#FFFFFF", "#000000"];
const PARTICULAS = 70;
const DURACAO_MS = 2000;
const GRAVIDADE = 0.0016;

/** Solta os confetes a partir de `origem` e devolve a função que interrompe a animação. */
export function dispararConfete(canvas: HTMLCanvasElement, origem: { x: number; y: number }) {
  const contexto = canvas.getContext("2d");
  if (!contexto) return () => {};
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  const largura = window.innerWidth;
  const altura = window.innerHeight;
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  contexto.scale(escala, escala);

  const particulas = Array.from({ length: PARTICULAS }, (_, i) => {
    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
    const velocidade = 0.45 + Math.random() * 0.75;
    return {
      x: origem.x,
      y: origem.y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.012,
      tamanho: 6 + Math.random() * 5,
      cor: CORES[i % CORES.length],
    };
  });

  const ctx = contexto;
  let quadro = 0;
  const inicio = performance.now();
  let anterior = inicio;
  function desenhar(agora: number) {
    const passo = Math.min(agora - anterior, 40);
    anterior = agora;
    const passado = agora - inicio;
    ctx.clearRect(0, 0, largura, altura);
    if (passado >= DURACAO_MS) return;
    ctx.globalAlpha = passado > DURACAO_MS * 0.75 ? (DURACAO_MS - passado) / (DURACAO_MS * 0.25) : 1;
    for (const p of particulas) {
      p.vy += GRAVIDADE * passo;
      p.x += p.vx * passo;
      p.y += p.vy * passo;
      p.giro += p.vgiro * passo;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.tamanho / 2, -p.tamanho / 4, p.tamanho, p.tamanho / 2);
      ctx.restore();
    }
    quadro = requestAnimationFrame(desenhar);
  }
  quadro = requestAnimationFrame(desenhar);
  return () => cancelAnimationFrame(quadro);
}
