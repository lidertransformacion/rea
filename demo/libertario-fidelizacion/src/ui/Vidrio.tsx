import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, View, type StyleProp, type ViewStyle } from "react-native";

import { blanco, sombra } from "@/src/ui/tema";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  oscuro?: boolean;
};

export function Vidrio({ children, style, oscuro = false }: Props) {
  if (Platform.OS === "android") {
    return (
      <View
        style={[
          {
            backgroundColor: oscuro ? "rgba(27,22,18,0.94)" : blanco,
            borderWidth: 1,
            borderColor: oscuro
              ? "rgba(255,255,255,0.12)"
              : "rgba(27,22,18,0.06)",
            overflow: "hidden",
            ...sombra,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={oscuro ? 32 : 26}
      tint={oscuro ? "dark" : "light"}
      style={[
        {
          overflow: "hidden",
          borderWidth: 1,
          borderColor: oscuro
            ? "rgba(255,255,255,0.16)"
            : "rgba(255,255,255,0.62)",
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}
