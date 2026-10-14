import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { SEDES } from "@/src/datos/programa";
import {
  crema,
  humo,
  linea,
  sans,
  sansMedia,
  serif,
  tinta,
  tueste,
} from "@/src/ui/tema";

export function ElegirSede({
  abierto,
  sedeId,
  cerrar,
  elegir,
}: {
  abierto: boolean;
  sedeId: string;
  cerrar: () => void;
  elegir: (id: string) => void;
}) {
  return (
    <Modal
      visible={abierto}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <Pressable style={styles.velo} onPress={cerrar}>
        <Pressable style={styles.hoja}>
          <Text style={styles.kicker}>La casa</Text>
          <Text style={styles.titulo}>Dónde se anota</Text>
          <Text style={styles.nota}>
            Este demo no usa el GPS. Zona G queda como la casa más cerca. La
            carta es la misma; cambian el pedido y el historial.
          </Text>
          {SEDES.map((sede) => {
            const activa = sede.id === sedeId;
            return (
              <Pressable
                key={sede.id}
                onPress={() => {
                  elegir(sede.id);
                  cerrar();
                }}
                style={[styles.fila, activa && styles.filaActiva]}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
              >
                <View>
                  <Text style={styles.nombre}>{sede.nombre}</Text>
                  <Text style={styles.etiqueta}>{sede.etiqueta}</Text>
                </View>
                <Text style={styles.marca}>
                  {activa ? "Esta" : sede.cerca ? "Cerca" : ""}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: {
    flex: 1,
    backgroundColor: "rgba(27,22,18,0.36)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  hoja: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: crema,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  kicker: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: humo,
  },
  titulo: {
    fontFamily: serif,
    fontSize: 32,
    color: tinta,
    marginTop: 4,
  },
  nota: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 21,
    color: tinta,
    marginTop: 8,
    marginBottom: 16,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: linea,
  },
  filaActiva: {
    backgroundColor: "rgba(122,67,40,0.06)",
  },
  nombre: {
    fontFamily: serif,
    fontSize: 20,
    color: tinta,
  },
  etiqueta: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 2,
  },
  marca: {
    fontFamily: sansMedia,
    fontSize: 13,
    color: tueste,
  },
});
