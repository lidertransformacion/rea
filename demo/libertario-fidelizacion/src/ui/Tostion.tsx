import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { usePermiteMovimiento } from "@/src/ui/movimiento";
import { serifItalica, tinta } from "@/src/ui/tema";

function Grano({
  indice,
  progreso,
}: {
  indice: number;
  progreso: SharedValue<number>;
}) {
  const estilo = useAnimatedStyle(() => {
    const giro = indice * 45;
    return {
      backgroundColor: interpolateColor(
        progreso.value,
        [0, 0.42, 1],
        ["#9aaf86", "#8a4b28", "#2a1810"],
      ),
      opacity: 0.45 + progreso.value * 0.55,
      transform: [
        { rotate: `${giro}deg` },
        { translateY: -46 },
        { rotate: `${-giro}deg` },
        { scale: 0.82 + progreso.value * 0.22 },
      ],
    };
  });

  return <Animated.View style={[styles.grano, estilo]} />;
}

export function Tostion({
  linea,
  alTerminar,
}: {
  linea?: string;
  alTerminar?: () => void;
}) {
  const progreso = useSharedValue(0);
  const amplitud = useSharedValue(48);
  const permite = usePermiteMovimiento();

  const fin = useRef(alTerminar);
  fin.current = alTerminar;
  const avisar = useCallback(() => {
    fin.current?.();
  }, []);

  useEffect(() => {
    amplitud.value = permite ? 48 : 0;
    const duracion = permite ? 2000 : 280;
    progreso.value = withTiming(
      1,
      { duration: duracion, easing: Easing.inOut(Easing.cubic) },
      (finAnimacion) => {
        if (finAnimacion) runOnJS(avisar)();
      },
    );
  }, [amplitud, avisar, permite, progreso]);

  const anillo = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progreso.value * amplitud.value}deg` }],
  }));

  return (
    <View
      style={styles.caja}
      accessibilityRole="image"
      accessibilityLabel="Café en tostión"
    >
      <Animated.View style={[styles.anillo, anillo]}>
        {Array.from({ length: 8 }, (_, indice) => (
          <Grano key={indice} indice={indice} progreso={progreso} />
        ))}
      </Animated.View>
      <View style={styles.nucleo} />
      {linea ? <Text style={styles.linea}>{linea}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tinta,
  },
  anillo: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  grano: {
    position: "absolute",
    width: 18,
    height: 26,
    borderRadius: 10,
  },
  nucleo: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#c4a574",
  },
  linea: {
    position: "absolute",
    bottom: 88,
    left: 32,
    right: 32,
    textAlign: "center",
    color: "#fff",
    fontFamily: serifItalica,
    fontSize: 22,
  },
});
