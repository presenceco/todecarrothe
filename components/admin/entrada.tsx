import Image from "next/image";

/**
 * Moldura das telas de entrada do painel (login 11/26, esqueci e redefinir senha no mesmo padrão):
 * no mobile, topo preto de 360px com a marca e o cartão subindo 64px sobre ele; no desktop, metade preta
 * com a marca e o cartão de 500px centralizado na outra metade.
 */
export function Entrada({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <div className="box-border flex h-[calc(360px+env(safe-area-inset-top,0px))] flex-none flex-col items-center gap-18 bg-black pt-[calc(52px+env(safe-area-inset-top,0px))] lg:h-auto lg:justify-center lg:gap-28 lg:pt-0">
        <Image src="/marca/logo-vertical.png" alt="Tô de Carro Seminovos" width={1440} height={790} preload className="block w-250 lg:w-440" />
        <div aria-hidden="true" className="h-1 w-160 bg-filete lg:w-280" />
        <p className="text-14 font-light tracking-tagline-42 whitespace-nowrap text-gray-350">PAINEL DO LOJISTA</p>
      </div>
      <main className="relative mx-16 -mt-64 pb-32 lg:m-0 lg:flex lg:items-center lg:justify-center lg:p-0">
        <div className="relative flex flex-col gap-16 rounded-16 bg-white px-20 py-24 shadow-login-card lg:w-500 lg:gap-18 lg:p-40 lg:shadow-login-card-desktop">
          <div>
            <h1 className="text-22 font-bold lg:text-26">{titulo}</h1>
            <p className="mt-4 text-15 leading-145 text-gray-600 lg:mt-6">{subtitulo}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
