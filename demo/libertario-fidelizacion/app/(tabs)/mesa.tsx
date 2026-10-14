import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { piezaDe, puntosDePieza } from "@/src/datos/carta";
import { sedePorId } from "@/src/datos/programa";
import { useCuenta } from "@/src/estado/cuenta";
import { enteros, pesos } from "@/src/formato";
import { Marco } from "@/src/ui/Marco";
import { Marca } from "@/src/ui/Marca";
import {
  humo,
  linea,
  sans,
  sansMedia,
  serif,
  serifItalica,
  tinta,
  tueste,
  crema,
} from "@/src/ui/tema";

export default function Mesa() {
  const {
    cuenta,
    nota,
    cerrarNota,
    fijarMesa,
    quitarMesa,
    anotarComanda,
    avisarSala,
  } = useCuenta();
  if (!cuenta) return null;
  const sede = sedePorId(cuenta.sedeId);
  const lineas = cuenta.comanda
    .map((linea) => {
      const pieza = piezaDe(linea.itemId);
      return pieza ? { pieza, cantidad: linea.cantidad } : null;
    })
    .filter(
      (
        linea,
      ): linea is {
        pieza: NonNullable<ReturnType<typeof piezaDe>>;
        cantidad: number;
      } => linea !== null,
    );

  return (
    <Marco>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>La mesa</Text>
        <Text style={styles.titulo}>Mesa {cuenta.mesa || "—"}</Text>
        <Text style={styles.bajada}>
          El pedido se arma aquí, en {sede.nombre}. Se cobra en el mostrador. La
          app no paga.
        </Text>
        {nota ? (
          <Pressable onPress={cerrarNota} style={styles.nota}>
            <Text style={styles.notaTexto}>{nota}</Text>
          </Pressable>
        ) : null}
        <Text style={styles.etiqueta}>Número</Text>
        <TextInput
          value={cuenta.mesa}
          onChangeText={fijarMesa}
          keyboardType="number-pad"
          style={styles.input}
          accessibilityLabel="Número de mesa"
          testID="mesa-numero"
        />
        <View style={styles.marca}>
          <Marca
            valor={`libertario:mesa:${cuenta.sedeId}:${cuenta.mesa || "0"}`}
            tamano={148}
          />
        </View>
        <Text style={styles.codigo}>Código de esta mesa. No es un pago.</Text>
        <Text style={styles.seccion}>La comanda</Text>
        {lineas.length === 0 ? (
          <Text style={styles.vacio}>Todavía no hay nada sobre la mesa.</Text>
        ) : null}
        {lineas.map(({ pieza, cantidad }) => (
          <View key={pieza.id} style={styles.fila}>
            <View style={styles.filaTexto}>
              <Text style={styles.filaNombre}>
                {cantidad} · {pieza.nombre}
              </Text>
              <Text style={styles.filaSuave}>
                {pesos(pieza.precio * cantidad)} · suma{" "}
                {enteros(puntosDePieza(pieza) * cantidad)} al cobrar
              </Text>
            </View>
            <Pressable
              onPress={() => quitarMesa(pieza.id)}
              accessibilityRole="button"
            >
              <Text style={styles.quitar}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={avisarSala}
          style={styles.botonClaro}
          accessibilityRole="button"
          testID="mesa-avisar"
        >
          <Text style={styles.botonClaroTexto}>Avisar en sala</Text>
        </Pressable>
        <Pressable
          onPress={anotarComanda}
          style={styles.boton}
          accessibilityRole="button"
          testID="mesa-caja"
        >
          <Text style={styles.botonTexto}>Anotar la comanda en caja</Text>
        </Pressable>
        <Text style={styles.pie}>
          En la tienda, la caja cobra. Aquí solo se anotan los puntos y las
          tazas.
        </Text>
      </ScrollView>
    </Marco>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 140,
  },
  kicker: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: humo,
  },
  titulo: {
    fontFamily: serif,
    fontSize: 42,
    color: tinta,
    marginTop: 4,
  },
  bajada: {
    fontFamily: serifItalica,
    fontSize: 17,
    lineHeight: 24,
    color: tinta,
    marginTop: 6,
  },
  nota: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: linea,
    borderRadius: 12,
    padding: 12,
  },
  notaTexto: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: tinta,
  },
  etiqueta: {
    fontFamily: sansMedia,
    fontSize: 13,
    color: humo,
    marginTop: 20,
  },
  input: {
    fontFamily: serif,
    fontSize: 32,
    color: tinta,
    borderBottomWidth: 1,
    borderBottomColor: linea,
    paddingVertical: 4,
  },
  marca: {
    alignItems: "center",
    marginTop: 22,
  },
  codigo: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    textAlign: "center",
    marginTop: 8,
  },
  seccion: {
    fontFamily: serif,
    fontSize: 28,
    color: tinta,
    marginTop: 26,
  },
  vacio: {
    fontFamily: serifItalica,
    fontSize: 16,
    color: humo,
    marginTop: 8,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: linea,
  },
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: sansMedia,
    fontSize: 16,
    color: tinta,
  },
  filaSuave: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 2,
  },
  quitar: {
    fontFamily: sans,
    color: tueste,
    fontSize: 14,
  },
  botonClaro: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: tinta,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonClaroTexto: {
    fontFamily: sansMedia,
    color: tinta,
    fontSize: 16,
  },
  boton: {
    marginTop: 10,
    backgroundColor: tinta,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  botonTexto: {
    fontFamily: sansMedia,
    color: crema,
    fontSize: 16,
  },
  pie: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: humo,
    marginTop: 12,
  },
});
