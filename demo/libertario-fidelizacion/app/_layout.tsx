import {
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
} from "@expo-google-fonts/fraunces";
import { Outfit_400Regular, Outfit_500Medium } from "@expo-google-fonts/outfit";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import { produccionBloqueada } from "@/src/datos/programa";
import { CuentaProvider, useCuenta } from "@/src/estado/cuenta";
import { Tostion } from "@/src/ui/Tostion";
import { CapaVuelo, VueloProvider } from "@/src/ui/Vuelo";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [listo, error] = useFonts({
    Fraunces: Fraunces_500Medium,
    FrauncesItalica: Fraunces_500Medium_Italic,
    Outfit: Outfit_400Regular,
    OutfitMedia: Outfit_500Medium,
  });

  useEffect(() => {
    if (listo || error) void SplashScreen.hideAsync();
  }, [listo, error]);

  if (!listo && !error) return null;
  if (produccionBloqueada()) {
    return (
      <View style={styles.bloqueo}>
        <Text style={styles.bloqueoTexto}>
          Esta demo no habla con la tienda de producción.
        </Text>
      </View>
    );
  }

  return (
    <CuentaProvider>
      <VueloProvider>
        <View style={styles.raiz}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              contentStyle: { backgroundColor: "#fff" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="alta" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="libro" options={{ animation: "fade" }} />
            <Stack.Screen
              name="pieza/[id]"
              options={{ animation: "fade", animationDuration: 320 }}
            />
          </Stack>
          <CapaTostion />
          <CapaVuelo />
        </View>
      </VueloProvider>
    </CuentaProvider>
  );
}

function CapaTostion() {
  const { brasa } = useCuenta();
  if (!brasa) return null;
  return (
    <View style={styles.capa} pointerEvents="auto">
      <Tostion linea={brasa.linea || undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bloqueo: {
    flex: 1,
    backgroundColor: "#1b1612",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  bloqueoTexto: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
  },
  capa: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
  },
});
