import type { ImageSourcePropType } from "react-native";

import barra from "../../assets/carta/barra.jpg";
import bebidas from "../../assets/carta/bebidas.jpg";
import bowls from "../../assets/carta/bowls.jpg";
import brunch from "../../assets/carta/brunch.jpg";
import cafe from "../../assets/carta/cafe.jpg";
import dulce from "../../assets/carta/dulce.jpg";
import espresso from "../../assets/carta/espresso.jpg";
import filtrado from "../../assets/carta/filtrado.jpg";
import matcha from "../../assets/carta/matcha.jpg";
import pan from "../../assets/carta/pan.jpg";
import sandwiches from "../../assets/carta/sandwiches.jpg";
import tortas from "../../assets/carta/tortas.jpg";
import tostadas from "../../assets/carta/tostadas.jpg";

export const fotos: Record<string, ImageSourcePropType> = {
  "barra.jpg": barra,
  "bebidas.jpg": bebidas,
  "bowls.jpg": bowls,
  "brunch.jpg": brunch,
  "cafe.jpg": cafe,
  "dulce.jpg": dulce,
  "espresso.jpg": espresso,
  "filtrado.jpg": filtrado,
  "matcha.jpg": matcha,
  "pan.jpg": pan,
  "sandwiches.jpg": sandwiches,
  "tortas.jpg": tortas,
  "tostadas.jpg": tostadas,
};

export const fotoPortada = cafe;

export function fotoDe(nombre: string): ImageSourcePropType {
  return fotos[nombre] ?? cafe;
}
