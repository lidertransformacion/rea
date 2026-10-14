import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCuenta } from "@/src/estado/cuenta";
import { sans, sansMedia, tinta } from "@/src/ui/tema";
import { Vidrio } from "@/src/ui/Vidrio";

const LUGARES = [
  { name: "casa", titulo: "Casa" },
  { name: "carta", titulo: "Carta" },
  { name: "mesa", titulo: "Mesa" },
] as const;

export default function TabsLayout() {
  const { lista, cuenta } = useCuenta();
  const insets = useSafeAreaInsets();
  if (!lista) return <View style={styles.espera} />;
  if (!cuenta) return <Redirect href="/alta" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 74 + insets.bottom,
        },
      }}
      tabBar={({ state, navigation }) => (
        <Barra
          indice={state.index}
          rutas={state.routes}
          navegar={(nombre) => navigation.navigate(nombre)}
        />
      )}
    >
      <Tabs.Screen name="casa" />
      <Tabs.Screen name="carta" />
      <Tabs.Screen name="mesa" />
    </Tabs>
  );
}

function Barra({
  indice,
  rutas,
  navegar,
}: {
  indice: number;
  rutas: { key: string; name: string }[];
  navegar: (nombre: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [ancho, setAncho] = useState(0);
  const marca = useSharedValue(indice);

  useEffect(() => {
    marca.value = withSpring(indice, {
      damping: 16,
      stiffness: 220,
      mass: 0.6,
    });
  }, [indice, marca]);

  const pastilla = useAnimatedStyle(() => ({
    transform: [
      { translateX: marca.value * (ancho / Math.max(rutas.length, 1)) },
    ],
  }));
  const hueco = ancho / Math.max(rutas.length, 1);

  return (
    <View
      style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <Vidrio style={styles.vidrio}>
        <View
          style={styles.riel}
          onLayout={(evento) => setAncho(evento.nativeEvent.layout.width)}
        >
          {ancho > 0 ? (
            <Animated.View
              style={[styles.pastilla, { width: hueco }, pastilla]}
            />
          ) : null}
          {rutas.map((ruta, i) => {
            const lugar = LUGARES.find((item) => item.name === ruta.name);
            const activa = indice === i;
            return (
              <Pressable
                key={ruta.key}
                onPress={() => navegar(ruta.name)}
                style={styles.lugar}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                testID={`lugar-${ruta.name}`}
              >
                <Text style={[styles.texto, activa && styles.textoActivo]}>
                  {lugar?.titulo ?? ruta.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Vidrio>
    </View>
  );
}

const styles = StyleSheet.create({
  espera: {
    flex: 1,
    backgroundColor: "#fff",
  },
  barra: {
    paddingHorizontal: 22,
  },
  vidrio: {
    borderRadius: 28,
  },
  riel: {
    flexDirection: "row",
    position: "relative",
  },
  pastilla: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 0,
    borderRadius: 22,
    backgroundColor: "rgba(122,67,40,0.1)",
  },
  lugar: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  texto: {
    fontFamily: sans,
    fontSize: 15,
    color: "#6a6a6a",
  },
  textoActivo: {
    fontFamily: sansMedia,
    color: tinta,
  },
});
