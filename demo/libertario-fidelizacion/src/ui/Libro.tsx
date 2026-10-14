import { useState } from "react";
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  capitulosDeLaCarta,
  puntosDePieza,
  type Capitulo,
} from "@/src/datos/carta";
import { fotoDe, fotoPortada } from "@/src/datos/fotos";
import { enteros, pesos } from "@/src/formato";
import { usePermiteMovimiento } from "@/src/ui/movimiento";
import {
  blanco,
  crema,
  humo,
  linea,
  sans,
  sansMedia,
  serif,
  serifItalica,
  sombra,
  tinta,
  tueste,
} from "@/src/ui/tema";

const ANCHO = 340;

function HojaPortada() {
  return (
    <View style={styles.portada}>
      <Image source={fotoPortada} style={styles.portadaFoto} />
      <View style={styles.portadaVelo} />
      <Text style={styles.portadaKicker}>Libertario</Text>
      <Text style={styles.portadaTitulo}>La carta</Text>
      <Text style={styles.portadaLinea}>
        Lo que se tuesta y lo que se sirve.
      </Text>
    </View>
  );
}

function HojaCapitulo({ capitulo }: { capitulo: Capitulo }) {
  return (
    <View style={styles.capitulo}>
      <Image
        source={fotoDe(capitulo.categoria.foto)}
        style={styles.capituloFoto}
      />
      <Text style={styles.capituloNombre}>{capitulo.categoria.nombre}</Text>
      <Text style={styles.capituloIntro}>{capitulo.categoria.intro}</Text>
      <View style={styles.regla} />
      {capitulo.piezas.map((pieza) => (
        <View key={pieza.id} style={styles.pieza}>
          <View style={styles.piezaTexto}>
            <Text style={styles.piezaNombre}>{pieza.nombre}</Text>
            <Text style={styles.piezaPuntos}>
              Suma {enteros(puntosDePieza(pieza))}
            </Text>
          </View>
          <Text style={styles.piezaPrecio}>{pesos(pieza.precio)}</Text>
        </View>
      ))}
      {capitulo.resto > 0 ? (
        <Text style={styles.resto}>
          Y {capitulo.resto} más, en la carta corrida.
        </Text>
      ) : null}
    </View>
  );
}

export function Libro({ cerrar }: { cerrar: () => void }) {
  const capitulos = capitulosDeLaCarta();
  const total = capitulos.length + 1;
  const [hoja, setHoja] = useState(0);
  const [ocupada, setOcupada] = useState(false);
  const giro = useSharedValue(0);
  const permite = usePermiteMovimiento();

  const soltar = () => {
    giro.value = 0;
    setOcupada(false);
  };

  const pasar = () => {
    if (ocupada || hoja >= total - 1) return;
    setOcupada(true);
    if (!permite) {
      setHoja((n) => n + 1);
      setOcupada(false);
      return;
    }
    giro.value = withTiming(
      -180,
      { duration: 680, easing: Easing.inOut(Easing.cubic) },
      (fin) => {
        if (!fin) return;
        runOnJS(setHoja)(hoja + 1);
        runOnJS(soltar)();
      },
    );
  };

  const volver = () => {
    if (ocupada || hoja <= 0) return;
    setOcupada(true);
    if (!permite) {
      setHoja((n) => n - 1);
      setOcupada(false);
      return;
    }
    giro.value = -180;
    setHoja((n) => n - 1);
    giro.value = withTiming(
      0,
      { duration: 680, easing: Easing.inOut(Easing.cubic) },
      (fin) => {
        if (fin) runOnJS(soltar)();
      },
    );
  };

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesto) => Math.abs(gesto.dx) > 12,
    onPanResponderRelease: (_, gesto) => {
      if (gesto.dx < -36) pasar();
      else if (gesto.dx > 36) volver();
    },
  });

  const estiloGiro = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { translateX: ANCHO / 2 },
      { rotateY: `${giro.value}deg` },
      { translateX: -ANCHO / 2 },
    ],
  }));

  const velo = useAnimatedStyle(() => ({
    opacity: Math.min(0.42, Math.abs(giro.value) / 200),
  }));

  const actual = hoja === 0 ? null : (capitulos[hoja - 1] ?? null);
  const debajo = capitulos[hoja] ?? null;

  return (
    <View style={styles.escena}>
      <View style={styles.cabeza}>
        <Pressable onPress={cerrar} accessibilityRole="button">
          <Text style={styles.cerrar}>Cerrar</Text>
        </Pressable>
        <Text style={styles.cuenta}>
          {hoja + 1} / {total}
        </Text>
      </View>
      <View style={styles.atril} {...pan.panHandlers}>
        <View style={styles.debajo}>
          {debajo ? (
            <HojaCapitulo capitulo={debajo} />
          ) : (
            <View style={styles.fin} />
          )}
        </View>
        <Animated.View style={[styles.sombraPagina, estiloGiro]}>
          <View style={styles.encima}>
            {actual ? <HojaCapitulo capitulo={actual} /> : <HojaPortada />}
            <Animated.View pointerEvents="none" style={[styles.velo, velo]} />
          </View>
        </Animated.View>
      </View>
      <View style={styles.controles}>
        <Pressable
          onPress={volver}
          disabled={hoja === 0}
          accessibilityRole="button"
          testID="libro-anterior"
        >
          <Text style={[styles.control, hoja === 0 && styles.controlApagado]}>
            Anterior
          </Text>
        </Pressable>
        <Pressable
          onPress={pasar}
          disabled={hoja >= total - 1}
          accessibilityRole="button"
          testID="libro-siguiente"
        >
          <Text
            style={[styles.control, hoja >= total - 1 && styles.controlApagado]}
          >
            Pasar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  escena: {
    flex: 1,
    backgroundColor: tinta,
    paddingBottom: 28,
  },
  cabeza: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
  },
  cerrar: {
    fontFamily: sansMedia,
    color: crema,
    fontSize: 15,
  },
  cuenta: {
    fontFamily: sans,
    color: humo,
    fontSize: 13,
  },
  atril: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  debajo: {
    position: "absolute",
    width: ANCHO,
    height: 520,
    backgroundColor: blanco,
    borderRadius: 4,
    overflow: "hidden",
    ...sombra,
  },
  sombraPagina: {
    width: ANCHO,
    height: 520,
    borderRadius: 4,
    backgroundColor: blanco,
    ...sombra,
  },
  encima: {
    flex: 1,
    backgroundColor: blanco,
    borderRadius: 4,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  velo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: tinta,
  },
  fin: {
    flex: 1,
    backgroundColor: "#2a211c",
  },
  portada: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 22,
  },
  portadaFoto: {
    ...StyleSheet.absoluteFill,
    width: undefined,
    height: undefined,
  },
  portadaVelo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(27,22,18,0.46)",
  },
  portadaKicker: {
    fontFamily: sansMedia,
    color: "#fff",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontSize: 12,
  },
  portadaTitulo: {
    fontFamily: serif,
    color: "#fff",
    fontSize: 48,
    marginTop: 6,
  },
  portadaLinea: {
    fontFamily: serifItalica,
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
  },
  capitulo: {
    flex: 1,
    padding: 18,
  },
  capituloFoto: {
    width: "100%",
    height: 132,
    borderRadius: 2,
    marginBottom: 14,
  },
  capituloNombre: {
    fontFamily: serif,
    fontSize: 28,
    color: tinta,
  },
  capituloIntro: {
    fontFamily: serifItalica,
    fontSize: 15,
    color: tueste,
    marginTop: 2,
  },
  regla: {
    height: 1,
    backgroundColor: linea,
    marginVertical: 12,
  },
  pieza: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 7,
  },
  piezaTexto: {
    flex: 1,
  },
  piezaNombre: {
    fontFamily: sansMedia,
    fontSize: 15,
    color: tinta,
  },
  piezaPuntos: {
    fontFamily: sans,
    fontSize: 12,
    color: humo,
    marginTop: 1,
  },
  piezaPrecio: {
    fontFamily: serif,
    fontSize: 16,
    color: tinta,
  },
  resto: {
    fontFamily: serifItalica,
    fontSize: 14,
    color: humo,
    marginTop: 10,
  },
  controles: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  control: {
    fontFamily: sansMedia,
    color: crema,
    fontSize: 16,
  },
  controlApagado: {
    color: "#5c5148",
  },
});
