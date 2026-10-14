import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  oscuro?: boolean;
};

export function Vidrio({ children, style, oscuro = false }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: oscuro
            ? "rgba(27,22,18,0.72)"
            : "rgba(255,255,255,0.58)",
          borderWidth: 1,
          borderColor: oscuro
            ? "rgba(255,255,255,0.14)"
            : "rgba(255,255,255,0.9)",
          overflow: "hidden",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          boxShadow: "0 14px 40px rgba(27,22,18,0.12)",
        } as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}
