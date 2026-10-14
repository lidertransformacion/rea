import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { create } from "qrcode";

import { tinta } from "@/src/ui/tema";

export function Marca({
  valor,
  tamano = 168,
}: {
  valor: string;
  tamano?: number;
}) {
  const celdas = useMemo(() => {
    const codigo = create(valor, { errorCorrectionLevel: "M" });
    const n = codigo.modules.size;
    const trazos: { x: number; y: number; w: number }[] = [];
    for (let y = 0; y < n; y += 1) {
      let x = 0;
      while (x < n) {
        if (!codigo.modules.get(y, x)) {
          x += 1;
          continue;
        }
        const inicio = x;
        while (x < n && codigo.modules.get(y, x)) x += 1;
        trazos.push({ x: inicio, y, w: x - inicio });
      }
    }
    return { n, trazos };
  }, [valor]);

  const quiet = 2;
  const lado = celdas.n + quiet * 2;

  return (
    <View accessibilityRole="image" accessibilityLabel="Código del mostrador">
      <Svg width={tamano} height={tamano} viewBox={`0 0 ${lado} ${lado}`}>
        <Rect width={lado} height={lado} fill="#ffffff" />
        {celdas.trazos.map((trazo) => (
          <Rect
            key={`${trazo.y}-${trazo.x}`}
            x={trazo.x + quiet}
            y={trazo.y + quiet}
            width={trazo.w}
            height={1}
            fill={tinta}
          />
        ))}
      </Svg>
    </View>
  );
}
