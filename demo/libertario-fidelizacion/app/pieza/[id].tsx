import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { categoriaDe, piezaDe, puntosDePieza } from "@/src/datos/carta";
import { fotoDe } from "@/src/datos/fotos";
import { useCuenta } from "@/src/estado/cuenta";
import { enteros, pesos } from "@/src/formato";
import { Marco } from "@/src/ui/Marco";
import { useVuelo } from "@/src/ui/Vuelo";
import {
  crema,
  humo,
  sans,
  sansMedia,
  serif,
  serifItalica,
  tinta,
} from "@/src/ui/tema";

export default function PiezaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { anotarPieza, sumarMesa } = useCuenta();
  const { origen, destino, fase, fijarDestino, volver, soltar } = useVuelo();
  const fotoRef = useRef<View>(null);
  const pieza = typeof id === "string" ? piezaDe(id) : undefined;

  useEffect(() => {
    if (fase !== "ida") return undefined;
    const espera = setTimeout(() => soltar(), 1600);
    return () => clearTimeout(espera);
  }, [fase, soltar]);

  if (!pieza) {
    return (
      <Marco>
        <Text style={styles.perdida}>Esa pieza no está en la carta.</Text>
      </Marco>
    );
  }
  const capitulo = categoriaDe(pieza.categoria);
  const puntos = puntosDePieza(pieza);
  const foto = fotoDe(capitulo?.foto ?? "cafe.jpg");
  const enVuelo =
    origen?.id === pieza.id &&
    destino !== null &&
    (fase === "ida" || fase === "vuelta");

  const medir = () => {
    fotoRef.current?.measureInWindow((x, y, ancho, alto) => {
      if (ancho > 0 && alto > 0) fijarDestino({ x, y, ancho, alto });
    });
  };

  const cerrar = () => {
    if (origen?.id === pieza.id) volver(() => router.back());
    else router.back();
  };

  return (
    <Marco>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={cerrar} accessibilityRole="button">
          <Text style={styles.volver}>Cerrar</Text>
        </Pressable>
        <View
          ref={fotoRef}
          collapsable={false}
          onLayout={medir}
          style={styles.marcoFoto}
        >
          <Image
            source={foto}
            style={[styles.foto, enVuelo && styles.fotoOculta]}
          />
        </View>
        <Text style={styles.kicker}>{capitulo?.nombre}</Text>
        <Text style={styles.nombre}>{pieza.nombre}</Text>
        {pieza.perfil ? (
          <Text style={styles.perfil}>{pieza.perfil}</Text>
        ) : null}
        <Text style={styles.descripcion}>{pieza.descripcion}</Text>
        <Text style={styles.precio}>{pesos(pieza.precio)}</Text>
        <Text style={styles.puntos}>
          En el mostrador esta pieza suma {enteros(puntos)}. Cada $100 son un
          punto.
        </Text>
        <Pressable
          onPress={() => {
            soltar();
            sumarMesa(pieza.id);
            router.push("/(tabs)/mesa");
          }}
          style={styles.botonClaro}
          accessibilityRole="button"
          testID="pieza-mesa"
        >
          <Text style={styles.botonClaroTexto}>Sumar a la mesa</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            soltar();
            anotarPieza(pieza.id);
            router.push("/(tabs)/casa");
          }}
          style={styles.boton}
          accessibilityRole="button"
          testID="pieza-caja"
        >
          <Text style={styles.botonTexto}>Anotar en caja</Text>
        </Pressable>
        <Text style={styles.pie}>
          No se cobra aquí. La caja de la sede es la que factura.
        </Text>
      </ScrollView>
    </Marco>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  volver: {
    fontFamily: sansMedia,
    color: tinta,
    fontSize: 15,
  },
  marcoFoto: {
    marginTop: 14,
  },
  foto: {
    width: "100%",
    height: 220,
    borderRadius: 2,
  },
  fotoOculta: {
    opacity: 0,
  },
  kicker: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: humo,
    marginTop: 16,
  },
  nombre: {
    fontFamily: serif,
    fontSize: 36,
    color: tinta,
    marginTop: 4,
  },
  perfil: {
    fontFamily: sansMedia,
    fontSize: 13,
    letterSpacing: 1,
    color: "#7a4328",
    marginTop: 4,
  },
  descripcion: {
    fontFamily: serifItalica,
    fontSize: 18,
    lineHeight: 26,
    color: tinta,
    marginTop: 10,
  },
  precio: {
    fontFamily: serif,
    fontSize: 28,
    color: tinta,
    marginTop: 16,
  },
  puntos: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 21,
    color: tinta,
    marginTop: 6,
  },
  botonClaro: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: tinta,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonClaroTexto: {
    fontFamily: sansMedia,
    color: tinta,
    fontSize: 16,
  },
  boton: {
    marginTop: 10,
    backgroundColor: tinta,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  botonTexto: {
    fontFamily: sansMedia,
    color: crema,
    fontSize: 16,
  },
  pie: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 12,
    lineHeight: 18,
  },
  perdida: {
    fontFamily: serif,
    fontSize: 24,
    color: tinta,
    padding: 24,
  },
});
