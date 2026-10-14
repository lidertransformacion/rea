import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { enteros } from "@/src/formato";
import { TAZAS_PARA_FILTRADO } from "@/src/datos/programa";
import { linea, serif, tueste } from "@/src/ui/tema";

let ultimoContado = 0;

function guardarUltimo(valor: number) {
  ultimoContado = valor;
}

export function Contador({
  valor,
  style,
}: {
  valor: number;
  style?: StyleProp<TextStyle>;
}) {
  const progreso = useSharedValue(ultimoContado);
  const [texto, setTexto] = useState(() => enteros(ultimoContado));
  const publicar = useCallback((n: number) => setTexto(enteros(n)), []);

  useAnimatedReaction(
    () => Math.round(progreso.value),
    (actual, anterior) => {
      if (actual !== anterior) runOnJS(publicar)(actual);
    },
  );

  useEffect(() => {
    const desde = ultimoContado;
    if (desde === valor) {
      publicar(valor);
      return;
    }
    progreso.value = desde;
    progreso.value = withTiming(
      valor,
      { duration: 880, easing: Easing.out(Easing.cubic) },
      (fin) => {
        if (fin) runOnJS(guardarUltimo)(valor);
      },
    );
  }, [progreso, publicar, valor]);

  return <Text style={style}>{texto}</Text>;
}

export function Riel({ avance }: { avance: number }) {
  const ancho = useSharedValue(0);

  useEffect(() => {
    ancho.value = withTiming(avance, {
      duration: 880,
      easing: Easing.out(Easing.cubic),
    });
  }, [ancho, avance]);

  const lleno = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, ancho.value)) * 100}%`,
  }));

  return (
    <View style={styles.riel}>
      <Animated.View style={[styles.lleno, lleno]} />
    </View>
  );
}

function Taza({
  llena,
  nueva,
  marca,
}: {
  llena: boolean;
  nueva: boolean;
  marca: boolean;
}) {
  const escala = useSharedValue(1);
  const y = useSharedValue(0);

  useEffect(() => {
    if (!nueva) return;
    escala.value = 0.35;
    y.value = -18;
    escala.value = withSpring(1, { damping: 7, stiffness: 210, mass: 0.55 });
    y.value = withSpring(0, { damping: 8, stiffness: 170, mass: 0.6 });
  }, [escala, nueva, y]);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: escala.value }],
  }));

  return (
    <Animated.View style={[styles.taza, llena && styles.tazaLlena, estilo]}>
      {marca && !llena ? <Text style={styles.marca}>8</Text> : null}
    </Animated.View>
  );
}

export function Sellos({ sellos }: { sellos: number }) {
  const [desde, setDesde] = useState(sellos);

  useEffect(() => {
    setDesde(sellos);
  }, [sellos]);

  return (
    <View style={styles.fila}>
      {Array.from({ length: TAZAS_PARA_FILTRADO }, (_, indice) => (
        <Taza
          key={indice}
          llena={indice < sellos}
          nueva={sellos > desde && indice >= desde && indice < sellos}
          marca={indice === TAZAS_PARA_FILTRADO - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  riel: {
    height: 2,
    backgroundColor: linea,
    marginTop: 12,
    overflow: "hidden",
  },
  lleno: {
    height: 2,
    backgroundColor: tueste,
  },
  fila: {
    flexDirection: "row",
    gap: 8,
  },
  taza: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: linea,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  tazaLlena: {
    backgroundColor: tueste,
    borderColor: tueste,
  },
  marca: {
    fontSize: 11,
    color: "#6a6a6a",
  },
});
