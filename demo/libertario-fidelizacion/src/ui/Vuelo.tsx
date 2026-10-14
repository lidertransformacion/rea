import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Image, StyleSheet, type ImageSourcePropType } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { sombra } from "@/src/ui/tema";

export type Recta = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
};

export type OrigenVuelo = Recta & {
  id: string;
  foto: ImageSourcePropType;
};

type Fase = "quieto" | "ida" | "vuelta";

type Estado = {
  origen: OrigenVuelo | null;
  destino: Recta | null;
  fase: Fase;
};

type Api = Estado & {
  lanzar: (origen: OrigenVuelo) => void;
  fijarDestino: (recta: Recta) => void;
  llegar: () => void;
  volver: (alTerminar: () => void) => void;
  soltar: () => void;
};

const Contexto = createContext<Api | null>(null);
const quieto: Estado = { origen: null, destino: null, fase: "quieto" };
const CURVA = Easing.bezier(0.22, 1, 0.36, 1);

export function VueloProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(quieto);
  const regreso = useRef<(() => void) | null>(null);

  const api = useMemo<Api>(
    () => ({
      ...estado,
      lanzar: (origen) => {
        regreso.current = null;
        setEstado({ origen, destino: null, fase: "ida" });
      },
      fijarDestino: (recta) =>
        setEstado((previo) => {
          if (previo.fase !== "ida" || previo.destino) return previo;
          return { ...previo, destino: recta };
        }),
      llegar: () =>
        setEstado((previo) =>
          previo.fase === "ida" ? { ...previo, fase: "quieto" } : previo,
        ),
      volver: (alTerminar) => {
        regreso.current = alTerminar;
        setEstado((previo) =>
          previo.origen ? { ...previo, fase: "vuelta" } : previo,
        );
      },
      soltar: () => {
        const seguir = regreso.current;
        regreso.current = null;
        setEstado(quieto);
        seguir?.();
      },
    }),
    [estado],
  );

  return <Contexto.Provider value={api}>{children}</Contexto.Provider>;
}

export function useVuelo(): Api {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("El vuelo no está en el árbol.");
  return valor;
}

export function CapaVuelo() {
  const { origen, destino, fase, llegar, soltar } = useVuelo();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const ancho = useSharedValue(0);
  const alto = useSharedValue(0);
  const llegarRef = useRef(llegar);
  const soltarRef = useRef(soltar);
  llegarRef.current = llegar;
  soltarRef.current = soltar;
  const alLlegar = useCallback(() => llegarRef.current(), []);
  const alSoltar = useCallback(() => soltarRef.current(), []);

  useLayoutEffect(() => {
    if (!origen) return;
    if (fase === "ida" && !destino) {
      x.value = origen.x;
      y.value = origen.y;
      ancho.value = origen.ancho;
      alto.value = origen.alto;
      return;
    }
    if (!destino) return;
    const curva = { duration: fase === "vuelta" ? 480 : 560, easing: CURVA };
    if (fase === "ida") {
      x.value = origen.x;
      y.value = origen.y;
      ancho.value = origen.ancho;
      alto.value = origen.alto;
      x.value = withTiming(destino.x, curva);
      y.value = withTiming(destino.y, curva);
      ancho.value = withTiming(destino.ancho, curva);
      alto.value = withTiming(destino.alto, curva, (fin) => {
        if (fin) runOnJS(alLlegar)();
      });
    } else if (fase === "vuelta") {
      x.value = withTiming(origen.x, curva);
      y.value = withTiming(origen.y, curva);
      ancho.value = withTiming(origen.ancho, curva);
      alto.value = withTiming(origen.alto, curva, (fin) => {
        if (fin) runOnJS(alSoltar)();
      });
    }
  }, [alLlegar, alSoltar, alto, ancho, destino, fase, origen, x, y]);

  const estilo = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: ancho.value,
    height: alto.value,
  }));

  if (!origen || (fase !== "ida" && fase !== "vuelta")) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.vuelo, sombra, estilo]}>
      <Image source={origen.foto} style={styles.foto} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vuelo: {
    position: "absolute",
    zIndex: 30,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
});
