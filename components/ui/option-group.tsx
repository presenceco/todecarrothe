import { cn } from "@/lib/cn";

/**
 * Grupo de opções em botões (prazo, câmbio, km, combustível, tipo, Sim/Não, forma de pagamento).
 * Por baixo são radios ou checkboxes nativos: funcionam com teclado, leitor de tela e envio de formulário.
 */
export type Opcao = { value: string; label: React.ReactNode };

const ALTURAS = {
  /** 44 px (filtros do desktop, tela 21) */
  44: "h-44",
  /** 48 px (painel de filtros, Sim/Não, pagamento) */
  48: "h-48",
  /** 52 px (prazo em duas linhas, tela 04) */
  52: "h-52 flex-col",
} as const;

type Props = {
  name: string;
  options: readonly Opcao[];
  /** radio: uma opção · checkbox: várias */
  type?: "radio" | "checkbox";
  /** Título do grupo. Fica visível com `legendClassName`; sem ele, só para leitores de tela. */
  legend: React.ReactNode;
  legendClassName?: string;
  height?: keyof typeof ALTURAS;
  textSize?: 14 | 15;
  /** box: botões de raio 12 em grade · pill: pílulas em linha (marcas no painel de filtros, tela 02). */
  shape?: "box" | "pill";
  /** Grade das opções (ex.: "grid grid-cols-4 gap-8"). */
  className?: string;
  /** Classes extras de cada opção (ex.: altura do desktop, "lg:h-52"). */
  itemClassName?: string;
  value?: string | readonly string[];
  defaultValue?: string | readonly string[];
  onValueChange?: (value: string, checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
};

export function OptionGroup({
  name,
  options,
  type = "radio",
  legend,
  legendClassName = "sr-only",
  height = 48,
  textSize = 14,
  shape = "box",
  className = "grid grid-cols-2 gap-8",
  itemClassName,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
  invalid,
}: Props) {
  const lista = (v: string | readonly string[] | undefined) => (v === undefined ? undefined : typeof v === "string" ? [v] : v);
  const controlado = lista(value);
  const inicial = lista(defaultValue);

  return (
    <fieldset disabled={disabled} aria-invalid={invalid || undefined} className="min-w-0">
      <legend className={legendClassName}>{legend}</legend>
      <div className={className}>
        {options.map((opcao) => (
          <label
            key={opcao.value}
            className={cn(
              "pressable box-border flex cursor-pointer items-center justify-center border font-semibold whitespace-nowrap",
              shape === "box" ? "rounded-12" : "flex-none gap-4 rounded-pill px-16",
              ALTURAS[height],
              textSize === 14 ? "text-14" : "text-15",
              "border-gray-200 bg-white text-ink hover:border-gray-400",
              "has-checked:border-brand has-checked:bg-brand has-checked:text-white",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
              "has-disabled:cursor-default has-disabled:opacity-50",
              invalid && "border-danger!",
              itemClassName,
            )}
          >
            <input
              type={type}
              name={name}
              value={opcao.value}
              className="sr-only"
              required={required && type === "radio"}
              {...(controlado
                ? { checked: controlado.includes(opcao.value), onChange: (e: React.ChangeEvent<HTMLInputElement>) => onValueChange?.(opcao.value, e.target.checked) }
                : {
                    defaultChecked: inicial?.includes(opcao.value),
                    onChange: onValueChange
                      ? (e: React.ChangeEvent<HTMLInputElement>) => onValueChange(opcao.value, e.target.checked)
                      : undefined,
                  })}
            />
            {opcao.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Rótulo em duas linhas do prazo ("48" / "meses"), tela 04. */
export function RotuloPrazo({ meses }: { meses: number }) {
  return (
    <>
      <span className="text-16 font-bold">{meses}</span>
      <span className="text-14 font-normal opacity-80">meses</span>
    </>
  );
}
