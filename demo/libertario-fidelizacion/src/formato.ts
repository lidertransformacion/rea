const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function pesos(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`;
}

export function enteros(valor: number): string {
  return valor.toLocaleString("es-CO");
}

export function conSigno(valor: number): string {
  const texto = Math.abs(valor).toLocaleString("es-CO");
  if (valor > 0) return `+${texto}`;
  if (valor < 0) return `−${texto}`;
  return "0";
}

export function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  const mes = MESES[fecha.getMonth()] ?? "";
  return `${fecha.getDate()} ${mes} ${fecha.getFullYear()}`;
}

export function fechaDeClave(clave: string): string {
  const [anio, mes, dia] = clave.split("-");
  const indice = Number(mes) - 1;
  const nombre = MESES[indice] ?? "";
  return `${Number(dia)} ${nombre} ${anio}`;
}

export function plano(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
