import { router } from "expo-router";
import { Marco } from "@/src/ui/Marco";
import { Libro } from "@/src/ui/Libro";

export default function LibroScreen() {
  return (
    <Marco oscuro>
      <Libro cerrar={() => router.back()} />
    </Marco>
  );
}
