/** Valores del programa vigente. $100 en caja = 1 punto. */
export const PESOS_POR_PUNTO = 100;

export const BONO_BIENVENIDA = 1000;

export const TAZAS_PARA_FILTRADO = 8;

export const VIGENCIA_PREMIOS = "2026-12-31";

export type Premio = {
  id: string;
  nombre: string;
  puntos: number;
  nota: string;
};

export const PREMIOS: readonly Premio[] = [
  {
    id: "americano",
    nombre: "Americano Paz o Libre",
    puntos: 700,
    nota: "Taza de Paz o de Libre.",
  },
  {
    id: "cappuccino",
    nombre: "Cappuccino Paz o Libre",
    puntos: 910,
    nota: "Taza de Paz o de Libre.",
  },
  {
    id: "croissant",
    nombre: "Croissant de almendras",
    puntos: 2000,
    nota: "Del horno de la casa.",
  },
];

export type Sede = {
  id: string;
  nombre: string;
  etiqueta: string;
  cerca: boolean;
};

/**
 * Zona G queda marcada como la más cerca solo en este demo.
 * No hay GPS. Calle 93 usa el nombre que ya aparece en el historial del programa.
 */
export const SEDES: readonly Sede[] = [
  {
    id: "zona-g",
    nombre: "Zona G",
    etiqueta: "Libertario Zona G",
    cerca: true,
  },
  {
    id: "calle-93",
    nombre: "Calle 93",
    etiqueta: "Libertario calle 93",
    cerca: false,
  },
  {
    id: "calle-85",
    nombre: "Calle 85",
    etiqueta: "Libertario calle 85",
    cerca: false,
  },
  {
    id: "usaquen",
    nombre: "Usaquén",
    etiqueta: "Libertario Usaquén",
    cerca: false,
  },
];

export const SEDE_INICIAL = "calle-93";

export function sedePorId(id: string): Sede {
  return SEDES.find((sede) => sede.id === id) ?? SEDES[1] ?? SEDES[0]!;
}

export function puntosDePrecio(precio: number): number {
  return Math.floor(precio / PESOS_POR_PUNTO);
}

const TAZAS = new Set([
  "filtrados",
  "espresso",
  "autor",
  "matcha",
  "cold-brew",
]);

export function esTaza(categoria: string): boolean {
  return TAZAS.has(categoria);
}

export function produccionBloqueada(): boolean {
  return (process.env.EXPO_PUBLIC_ODOO_URL ?? "").includes(
    "libertariocoffee.odoo.com",
  );
}
