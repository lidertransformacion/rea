import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useCuenta } from "@/src/estado/cuenta";
import { Marco } from "@/src/ui/Marco";
import { serif, serifItalica } from "@/src/ui/tema";
import { Tostion } from "@/src/ui/Tostion";

export default function Arranque() {
  const { lista, cuenta } = useCuenta();
  const listaRef = useRef(lista);
  const cuentaRef = useRef(cuenta);
  const termino = useRef(false);
  const yaSiguio = useRef(false);
  listaRef.current = lista;
  cuentaRef.current = cuenta;

  const seguir = () => {
    if (yaSiguio.current || !listaRef.current || !termino.current) return;
    yaSiguio.current = true;
    router.replace(cuentaRef.current ? "/(tabs)/casa" : "/alta");
  };

  useEffect(() => {
    seguir();
  }, [lista, cuenta]);

  return (
    <Marco oscuro>
      <StatusBar style="light" />
      <View style={styles.caja} testID="arranque">
        <Tostion
          alTerminar={() => {
            termino.current = true;
            seguir();
          }}
        />
        <View style={styles.marca} pointerEvents="none">
          <Text style={styles.nombre}>Libertario</Text>
          <Text style={styles.linea}>Tostión de la casa</Text>
        </View>
      </View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  caja: {
    flex: 1,
  },
  marca: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 72,
    alignItems: "center",
  },
  nombre: {
    fontFamily: serif,
    color: "#fff",
    fontSize: 40,
  },
  linea: {
    fontFamily: serifItalica,
    color: "#e7e7e7",
    fontSize: 16,
    marginTop: 4,
  },
});
