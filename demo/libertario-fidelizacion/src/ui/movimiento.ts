import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function usePermiteMovimiento(): boolean {
  const [permite, setPermite] = useState(true);

  useEffect(() => {
    let vivo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reducido) => {
      if (vivo) setPermite(!reducido);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (reducido) => {
        setPermite(!reducido);
      },
    );
    return () => {
      vivo = false;
      sub.remove();
    };
  }, []);

  return permite;
}
