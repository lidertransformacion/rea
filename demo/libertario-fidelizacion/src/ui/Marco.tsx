import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { margen, papel, tinta } from "@/src/ui/tema";

export function Marco({
  children,
  oscuro = false,
}: {
  children: ReactNode;
  oscuro?: boolean;
}) {
  return (
    <View style={[styles.exterior, oscuro && styles.exteriorOscuro]}>
      <SafeAreaView
        style={[styles.interior, oscuro && styles.interiorOscuro]}
        edges={["top", "left", "right"]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  exterior: {
    flex: 1,
    backgroundColor: margen,
    alignItems: "center",
  },
  exteriorOscuro: {
    backgroundColor: tinta,
  },
  interior: {
    flex: 1,
    width: "100%",
    maxWidth: 460,
    backgroundColor: papel,
  },
  interiorOscuro: {
    backgroundColor: tinta,
  },
});
