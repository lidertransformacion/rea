import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCuenta, type Alta } from "@/src/estado/cuenta";
import { Marco } from "@/src/ui/Marco";
import {
  humo,
  linea,
  sans,
  sansMedia,
  serif,
  serifItalica,
  tinta,
  tueste,
} from "@/src/ui/tema";

type Campo = keyof Alta;

const VACIO: Alta = { celular: "", correo: "", nombre: "", cedula: "" };

function erroresDe(alta: Alta): Partial<Record<Campo, string>> {
  const errores: Partial<Record<Campo, string>> = {};
  if (!/^3\d{9}$/.test(alta.celular.trim()))
    errores.celular = "Diez dígitos, empieza por 3.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alta.correo.trim()))
    errores.correo = "Hace falta un correo.";
  if (alta.nombre.trim().length < 2) errores.nombre = "El nombre queda corto.";
  if (!/^\d{6,10}$/.test(alta.cedula.trim()))
    errores.cedula = "Entre 6 y 10 dígitos.";
  return errores;
}

export default function AltaScreen() {
  const { entrar } = useCuenta();
  const [alta, setAlta] = useState<Alta>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});

  const poner = (campo: Campo, valor: string) => {
    setAlta((previo) => ({ ...previo, [campo]: valor }));
  };

  const enviar = () => {
    const hallados = erroresDe(alta);
    setErrores(hallados);
    if (Object.keys(hallados).length > 0) return;
    entrar(alta);
    router.replace("/(tabs)/casa");
  };

  return (
    <Marco>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>Libertario</Text>
        <Text style={styles.titulo}>Un momento</Text>
        <Text style={styles.bajada}>
          Celular, correo, nombre y cédula. Con eso entra el bono de 1.000
          puntos.
        </Text>
        <Campo
          etiqueta="Celular"
          valor={alta.celular}
          error={errores.celular}
          teclado="phone-pad"
          id="alta-celular"
          onChange={(v) => poner("celular", v)}
        />
        <Campo
          etiqueta="Correo"
          valor={alta.correo}
          error={errores.correo}
          teclado="email-address"
          id="alta-correo"
          onChange={(v) => poner("correo", v)}
        />
        <Campo
          etiqueta="Nombre"
          valor={alta.nombre}
          error={errores.nombre}
          teclado="default"
          id="alta-nombre"
          onChange={(v) => poner("nombre", v)}
        />
        <Campo
          etiqueta="Cédula"
          valor={alta.cedula}
          error={errores.cedula}
          teclado="number-pad"
          id="alta-cedula"
          onChange={(v) => poner("cedula", v)}
        />
        <Pressable
          onPress={enviar}
          style={styles.boton}
          accessibilityRole="button"
          testID="alta-entrar"
        >
          <Text style={styles.botonTexto}>Entrar a la casa</Text>
        </Pressable>
        <Text style={styles.pie}>
          La cédula se guarda en este teléfono, con el resto de la cuenta. No
          sale a producción.
        </Text>
      </ScrollView>
    </Marco>
  );
}

function Campo({
  etiqueta,
  valor,
  error,
  teclado,
  id,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  error?: string;
  teclado: "default" | "email-address" | "phone-pad" | "number-pad";
  id: string;
  onChange: (valor: string) => void;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={onChange}
        keyboardType={teclado}
        autoCapitalize={teclado === "email-address" ? "none" : "words"}
        autoCorrect={false}
        style={styles.input}
        testID={id}
        accessibilityLabel={etiqueta}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
  },
  kicker: {
    fontFamily: sansMedia,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: humo,
    fontSize: 12,
  },
  titulo: {
    fontFamily: serif,
    fontSize: 46,
    color: tinta,
    marginTop: 6,
  },
  bajada: {
    fontFamily: serifItalica,
    fontSize: 18,
    lineHeight: 26,
    color: tinta,
    marginTop: 8,
    marginBottom: 22,
  },
  campo: {
    marginBottom: 16,
  },
  etiqueta: {
    fontFamily: sansMedia,
    fontSize: 13,
    color: humo,
    marginBottom: 6,
  },
  input: {
    fontFamily: sans,
    fontSize: 18,
    color: tinta,
    borderBottomWidth: 1,
    borderBottomColor: linea,
    paddingVertical: 8,
  },
  error: {
    fontFamily: sans,
    color: tueste,
    marginTop: 6,
    fontSize: 13,
  },
  boton: {
    marginTop: 12,
    backgroundColor: tinta,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  botonTexto: {
    fontFamily: sansMedia,
    color: "#fff",
    fontSize: 16,
  },
  pie: {
    fontFamily: sans,
    color: humo,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
  },
});
