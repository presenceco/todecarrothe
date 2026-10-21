/** CPF: validação pelos dígitos verificadores, máscara de tela e máscara de privacidade. */

export function digitosCpf(valor: string) {
  return valor.replace(/\D/g, "");
}

function digitoVerificador(base: string) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/** Calcula os dois dígitos verificadores de uma base de 9 dígitos ("123456789" → "12345678909"). */
export function completarCpf(base9: string) {
  const d1 = digitoVerificador(base9);
  const d2 = digitoVerificador(base9 + d1);
  return `${base9}${d1}${d2}`;
}

export function cpfValido(valor: string) {
  const cpf = digitosCpf(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  return completarCpf(cpf.slice(0, 9)) === cpf;
}

/** "12345678909" → "123.456.789-09" */
export function formatarCpf(valor: string) {
  const c = digitosCpf(valor).padEnd(11, " ");
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`.trim();
}

/** "12345678909" → "***.456.789-**" (como as telas mostram no admin). */
export function mascararCpf(valor: string) {
  const c = digitosCpf(valor);
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**`;
}
