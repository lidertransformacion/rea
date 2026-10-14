import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PREMIOS, VIGENCIA_PREMIOS, sedePorId } from "@/src/datos/programa";
import { useCuenta } from "@/src/estado/cuenta";
import { conSigno, enteros, fechaCorta, fechaDeClave } from "@/src/formato";
import { NOTA_NATIVO } from "@/src/nativo";
import { ElegirSede } from "@/src/ui/ElegirSede";
import { Contador, Riel, Sellos } from "@/src/ui/cine";
import { Marco } from "@/src/ui/Marco";
import { Marca } from "@/src/ui/Marca";
import {
  crema,
  humo,
  linea,
  sans,
  sansMedia,
  serif,
  serifItalica,
  tinta,
  tueste,
} from "@/src/ui/tema";
import { Vidrio } from "@/src/ui/Vidrio";

export default function Casa() {
  const { cuenta, nota, cerrarNota, elegirSede, canjear, olvidar } =
    useCuenta();
  const [sedesAbiertas, setSedesAbiertas] = useState(false);
  if (!cuenta) return null;

  const sede = sedePorId(cuenta.sedeId);
  const siguiente = PREMIOS.find((premio) => premio.puntos > cuenta.puntos);
  const avance = siguiente ? Math.min(1, cuenta.puntos / siguiente.puntos) : 1;
  const alAlcance = PREMIOS.filter((premio) => premio.puntos <= cuenta.puntos);
  const despues = PREMIOS.filter((premio) => premio.puntos > cuenta.puntos);

  return (
    <Marco>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>La casa</Text>
        <Text style={styles.nombre}>{cuenta.nombre}</Text>
        <Pressable
          onPress={() => setSedesAbiertas(true)}
          accessibilityRole="button"
        >
          <Text style={styles.sede}>{sede.nombre}</Text>
        </Pressable>
        {!sede.cerca ? (
          <Text style={styles.lejos}>
            Estás en {sede.nombre}. En este demo, la casa más cerca es Zona G.{" "}
            <Text style={styles.enlace} onPress={() => elegirSede("zona-g")}>
              Ver Zona G
            </Text>
          </Text>
        ) : (
          <Text style={styles.cerca}>
            Zona G es la casa más cerca en este demo.
          </Text>
        )}

        {nota ? (
          <Pressable onPress={cerrarNota} style={styles.nota}>
            <Text style={styles.notaTexto}>{nota}</Text>
          </Pressable>
        ) : null}

        <Contador valor={cuenta.puntos} style={styles.saldo} />
        <Text style={styles.saldoPie}>puntos</Text>
        <Text style={styles.reglaTexto}>
          Cada $100 en el mostrador suman un punto.
        </Text>
        <Riel avance={avance} />
        <Text style={styles.meta}>
          {siguiente
            ? `Para ${siguiente.nombre} faltan ${enteros(siguiente.puntos - cuenta.puntos)}.`
            : "Los tres están al alcance."}
        </Text>

        <View style={styles.slip}>
          <Text style={styles.slipKicker}>Este mes</Text>
          <Text style={styles.slipTexto}>
            No vence ningún punto de esta cuenta.
          </Text>
          <Text style={styles.slipSuave}>
            Los premios se piden hasta el {fechaDeClave(VIGENCIA_PREMIOS)}.
          </Text>
        </View>

        <Text style={styles.seccion}>Las tazas</Text>
        <Text style={styles.seccionPie}>
          Ocho tazas. La octava es un filtrado Paz. No es un premio de puntos.
        </Text>
        <Sellos sellos={cuenta.sellos} />

        <Text style={styles.seccion}>Para la caja</Text>
        <Text style={styles.seccionPie}>
          Se muestra en el mostrador. No paga. Queda guardado en este teléfono,
          también sin red.
        </Text>
        <Vidrio style={styles.marca}>
          <Marca valor={`libertario:mostrador:${cuenta.codigo}`} />
          <Text style={styles.codigo}>{cuenta.codigo}</Text>
        </Vidrio>

        <Text style={styles.seccion}>Lo que se cambia por puntos</Text>
        <Text style={styles.seccionPie}>
          Se cambia entero. No se completa con plata. El canje no suma puntos.
        </Text>
        {alAlcance.length > 0 ? (
          <Text style={styles.grupo}>Con lo que tienes</Text>
        ) : null}
        {alAlcance.map((premio) => (
          <PremioFila
            key={premio.id}
            premio={premio}
            puede
            onCanjear={() => canjear(premio.id)}
          />
        ))}
        {despues.length > 0 ? (
          <Text style={styles.grupo}>Más adelante</Text>
        ) : null}
        {despues.map((premio) => (
          <PremioFila
            key={premio.id}
            premio={premio}
            puede={false}
            faltan={premio.puntos - cuenta.puntos}
            onCanjear={() => canjear(premio.id)}
          />
        ))}

        <Text style={styles.seccion}>En las sedes</Text>
        {cuenta.movimientos.map((movimiento) => (
          <View key={movimiento.id} style={styles.mov}>
            <View style={styles.movTexto}>
              <Text style={styles.movConcepto}>{movimiento.concepto}</Text>
              <Text style={styles.movLugar}>
                {fechaCorta(movimiento.fecha)}
                {movimiento.sede ? ` · ${movimiento.sede}` : ""}
              </Text>
            </View>
            <Text style={styles.movPuntos}>{conSigno(movimiento.puntos)}</Text>
          </View>
        ))}

        <Text style={styles.nativo}>{NOTA_NATIVO}</Text>
        <Pressable
          onPress={() => {
            olvidar();
            router.replace("/alta");
          }}
          accessibilityRole="button"
        >
          <Text style={styles.olvidar}>Olvidar este teléfono</Text>
        </Pressable>
      </ScrollView>
      <ElegirSede
        abierto={sedesAbiertas}
        sedeId={cuenta.sedeId}
        cerrar={() => setSedesAbiertas(false)}
        elegir={elegirSede}
      />
    </Marco>
  );
}

function PremioFila({
  premio,
  puede,
  faltan,
  onCanjear,
}: {
  premio: (typeof PREMIOS)[number];
  puede: boolean;
  faltan?: number;
  onCanjear: () => void;
}) {
  return (
    <View style={styles.premio}>
      <View style={styles.premioTexto}>
        <Text style={styles.premioNombre}>{premio.nombre}</Text>
        <Text style={styles.premioNota}>
          {enteros(premio.puntos)} puntos · {premio.nota}
        </Text>
        {!puede && faltan ? (
          <Text style={styles.premioFalta}>Faltan {enteros(faltan)}</Text>
        ) : null}
      </View>
      {puede ? (
        <Pressable
          onPress={onCanjear}
          style={styles.canje}
          accessibilityRole="button"
          testID={`canje-${premio.id}`}
        >
          <Text style={styles.canjeTexto}>Canjear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 130,
  },
  kicker: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: humo,
  },
  nombre: {
    fontFamily: serif,
    fontSize: 36,
    color: tinta,
    marginTop: 4,
  },
  sede: {
    fontFamily: serifItalica,
    fontSize: 18,
    color: tueste,
    marginTop: 2,
  },
  lejos: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: tinta,
    marginTop: 10,
  },
  cerca: {
    fontFamily: sans,
    fontSize: 14,
    color: humo,
    marginTop: 8,
  },
  enlace: {
    fontFamily: sansMedia,
    color: tueste,
  },
  nota: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: linea,
    borderRadius: 12,
  },
  notaTexto: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: tinta,
  },
  saldo: {
    fontFamily: serif,
    fontSize: 72,
    color: tinta,
    marginTop: 18,
    lineHeight: 76,
  },
  saldoPie: {
    fontFamily: sans,
    fontSize: 16,
    color: humo,
    marginTop: -4,
  },
  reglaTexto: {
    fontFamily: sans,
    fontSize: 14,
    color: tinta,
    marginTop: 12,
  },
  riel: {
    height: 2,
    backgroundColor: linea,
    marginTop: 12,
  },
  rielLleno: {
    height: 2,
    backgroundColor: tueste,
  },
  meta: {
    fontFamily: serifItalica,
    fontSize: 16,
    color: tinta,
    marginTop: 8,
  },
  slip: {
    marginTop: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: linea,
  },
  slipKicker: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: humo,
  },
  slipTexto: {
    fontFamily: serif,
    fontSize: 20,
    color: tinta,
    marginTop: 4,
  },
  slipSuave: {
    fontFamily: sans,
    fontSize: 14,
    color: humo,
    marginTop: 4,
  },
  seccion: {
    fontFamily: serif,
    fontSize: 28,
    color: tinta,
    marginTop: 28,
  },
  seccionPie: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: humo,
    marginTop: 4,
    marginBottom: 12,
  },
  tazas: {
    flexDirection: "row",
    gap: 8,
  },
  taza: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: linea,
    alignItems: "center",
    justifyContent: "center",
  },
  tazaLlena: {
    backgroundColor: tueste,
    borderColor: tueste,
  },
  tazaMarca: {
    fontFamily: sans,
    fontSize: 11,
    color: humo,
  },
  marca: {
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  codigo: {
    fontFamily: sansMedia,
    letterSpacing: 1.4,
    color: tinta,
    marginTop: 10,
  },
  grupo: {
    fontFamily: sansMedia,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: tueste,
    marginTop: 8,
    marginBottom: 4,
  },
  premio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: linea,
  },
  premioTexto: {
    flex: 1,
  },
  premioNombre: {
    fontFamily: serif,
    fontSize: 20,
    color: tinta,
  },
  premioNota: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 2,
  },
  premioFalta: {
    fontFamily: sans,
    fontSize: 13,
    color: tueste,
    marginTop: 2,
  },
  canje: {
    backgroundColor: tinta,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  canjeTexto: {
    fontFamily: sansMedia,
    color: crema,
    fontSize: 14,
  },
  mov: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: linea,
  },
  movTexto: {
    flex: 1,
  },
  movConcepto: {
    fontFamily: sansMedia,
    fontSize: 15,
    color: tinta,
  },
  movLugar: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 2,
  },
  movPuntos: {
    fontFamily: serif,
    fontSize: 18,
    color: tinta,
  },
  nativo: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: humo,
    marginTop: 28,
  },
  olvidar: {
    fontFamily: sans,
    fontSize: 14,
    color: tueste,
    marginTop: 18,
  },
});
