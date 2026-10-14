import { puntosDePrecio } from "@/src/datos/programa";
import { plano } from "@/src/formato";

import bruto from "./menu.json";

export type Categoria = {
  id: string;
  nombre: string;
  foto: string;
  intro: string;
};

export type Pieza = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  perfil?: string;
  vegano: boolean;
  nueces: boolean;
  adicion: boolean;
};

type Crudo = {
  categorias: Categoria[];
  items: (Omit<Pieza, "vegano" | "nueces" | "adicion"> & {
    puntos?: number;
    vegano?: boolean;
    nueces?: boolean;
    adicion?: boolean;
  })[];
};

const datos = bruto as Crudo;

export const categorias: Categoria[] = datos.categorias;

export const piezas: Pieza[] = datos.items.map((item) => ({
  id: item.id,
  nombre: item.nombre,
  categoria: item.categoria,
  precio: item.precio,
  descripcion: item.descripcion,
  ...(item.perfil ? { perfil: item.perfil } : {}),
  vegano: item.vegano ?? false,
  nueces: item.nueces ?? false,
  adicion: item.adicion ?? false,
}));

export function categoriaDe(id: string): Categoria | undefined {
  return categorias.find((categoria) => categoria.id === id);
}

export function piezaDe(id: string): Pieza | undefined {
  return piezas.find((pieza) => pieza.id === id);
}

export function puntosDePieza(pieza: Pieza): number {
  return puntosDePrecio(pieza.precio);
}

export type FiltroCarta = {
  texto: string;
  categoria: string | null;
  techo: number | null;
  vegetal: boolean;
  sinNueces: boolean;
};

export function filtrarCarta(filtro: FiltroCarta): Pieza[] {
  const texto = plano(filtro.texto.trim());
  return piezas.filter((pieza) => {
    if (pieza.adicion) return false;
    if (filtro.categoria && pieza.categoria !== filtro.categoria) return false;
    if (filtro.techo !== null && pieza.precio > filtro.techo) return false;
    if (filtro.vegetal && !pieza.vegano) return false;
    if (filtro.sinNueces && pieza.nueces) return false;
    if (!texto) return true;
    const capitulo = categoriaDe(pieza.categoria)?.nombre ?? "";
    return (
      plano(pieza.nombre).includes(texto) ||
      plano(pieza.descripcion).includes(texto) ||
      plano(capitulo).includes(texto)
    );
  });
}

export type Capitulo = {
  categoria: Categoria;
  piezas: Pieza[];
  resto: number;
};

export function capitulosDeLaCarta(): Capitulo[] {
  return categorias
    .filter((categoria) => categoria.id !== "adiciones")
    .map((categoria) => {
      const todas = piezas.filter(
        (pieza) => pieza.categoria === categoria.id && !pieza.adicion,
      );
      return {
        categoria,
        piezas: todas.slice(0, 4),
        resto: Math.max(0, todas.length - 4),
      };
    });
}
