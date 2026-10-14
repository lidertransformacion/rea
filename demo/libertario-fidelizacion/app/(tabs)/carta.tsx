import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useRef } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  categorias,
  filtrarCarta,
  puntosDePieza,
  type Pieza,
} from "@/src/datos/carta";
import { fotoDe } from "@/src/datos/fotos";
import { sedePorId } from "@/src/datos/programa";
import { useCuenta } from "@/src/estado/cuenta";
import { enteros, pesos } from "@/src/formato";
import { ElegirSede } from "@/src/ui/ElegirSede";
import { Marco } from "@/src/ui/Marco";
import { useVuelo } from "@/src/ui/Vuelo";
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

const TECHOS = [
  { id: "todo", etiqueta: "Todo", techo: null },
  { id: "15", etiqueta: "Hasta $15.000", techo: 15000 },
  { id: "30", etiqueta: "Hasta $30.000", techo: 30000 },
] as const;

export default function Carta() {
  const { cuenta, elegirSede } = useCuenta();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [techo, setTecho] = useState<number | null>(null);
  const [vegetal, setVegetal] = useState(false);
  const [sinNueces, setSinNueces] = useState(false);
  const [sedesAbiertas, setSedesAbiertas] = useState(false);

  const piezas = useMemo(
    () => filtrarCarta({ texto, categoria, techo, vegetal, sinNueces }),
    [categoria, sinNueces, techo, texto, vegetal],
  );

  if (!cuenta) return null;
  const sede = sedePorId(cuenta.sedeId);
  const capitulos = categorias.filter((item) => item.id !== "adiciones");

  return (
    <Marco>
      <View style={styles.cuerpo}>
        <View style={styles.cabecera}>
          <Text style={styles.kicker}>La carta</Text>
          <Pressable onPress={() => setSedesAbiertas(true)}>
            <Text style={styles.titulo}>{sede.nombre}</Text>
          </Pressable>
          {!sede.cerca ? (
            <Text style={styles.lejos}>
              Estás mirando {sede.nombre}. En este demo, la casa más cerca es
              Zona G.{" "}
              <Text style={styles.enlace} onPress={() => elegirSede("zona-g")}>
                Ver esa carta
              </Text>
            </Text>
          ) : null}
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar en la carta"
            placeholderTextColor={humo}
            style={styles.buscar}
            testID="carta-buscar"
            accessibilityLabel="Buscar en la carta"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.riel}
          >
            <Palabra
              activa={categoria === null}
              onPress={() => setCategoria(null)}
              texto="Toda"
            />
            {capitulos.map((item) => (
              <Palabra
                key={item.id}
                activa={categoria === item.id}
                onPress={() =>
                  setCategoria(categoria === item.id ? null : item.id)
                }
                texto={item.nombre}
              />
            ))}
          </ScrollView>
          <View style={styles.indice}>
            {TECHOS.map((item) => (
              <Palabra
                key={item.id}
                activa={techo === item.techo}
                onPress={() => setTecho(item.techo)}
                texto={item.etiqueta}
              />
            ))}
            <Palabra
              activa={vegetal}
              onPress={() => setVegetal((v) => !v)}
              texto="Vegetal"
            />
            <Palabra
              activa={sinNueces}
              onPress={() => setSinNueces((v) => !v)}
              texto="Sin nueces"
            />
          </View>
          <Pressable
            onPress={() => router.push("/libro")}
            accessibilityRole="button"
            testID="pasar-carta"
          >
            <Text style={styles.pasar}>Pasar la carta</Text>
          </Pressable>
        </View>
        <FlatList
          style={styles.listaFlex}
          data={piezas}
          keyExtractor={(pieza) => pieza.id}
          initialNumToRender={8}
          windowSize={5}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No está en la carta con ese filtro.
            </Text>
          }
          renderItem={({ item }) => <Fila pieza={item} />}
        />
      </View>
      <ElegirSede
        abierto={sedesAbiertas}
        sedeId={cuenta.sedeId}
        cerrar={() => setSedesAbiertas(false)}
        elegir={elegirSede}
      />
    </Marco>
  );
}

function Palabra({
  activa,
  texto,
  onPress,
}: {
  activa: boolean;
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
    >
      <Text style={[styles.palabra, activa && styles.palabraActiva]}>
        {texto}
      </Text>
    </Pressable>
  );
}

function Fila({ pieza }: { pieza: Pieza }) {
  const fotoRef = useRef<View>(null);
  const { lanzar } = useVuelo();
  const foto = fotoDe(
    categorias.find((item) => item.id === pieza.categoria)?.foto ?? "cafe.jpg",
  );
  const abrir = () => {
    const nodo = fotoRef.current;
    if (!nodo) {
      router.push(`/pieza/${pieza.id}`);
      return;
    }
    nodo.measureInWindow((x, y, ancho, alto) => {
      if (ancho > 0) lanzar({ id: pieza.id, x, y, ancho, alto, foto });
      router.push(`/pieza/${pieza.id}`);
    });
  };
  return (
    <Pressable onPress={abrir} style={styles.fila} accessibilityRole="button">
      <View ref={fotoRef} collapsable={false}>
        <Image source={foto} style={styles.foto} />
      </View>
      <View style={styles.filaTexto}>
        <Text style={styles.filaNombre}>{pieza.nombre}</Text>
        <Text style={styles.filaPuntos}>
          Suma {enteros(puntosDePieza(pieza))}
        </Text>
      </View>
      <Text style={styles.filaPrecio}>{pesos(pieza.precio)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: 24,
    paddingBottom: 130,
  },
  listaFlex: {
    flex: 1,
  },
  cuerpo: {
    flex: 1,
  },
  cabecera: {
    paddingHorizontal: 24,
    paddingTop: 18,
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
    fontSize: 40,
    color: tinta,
    marginTop: 2,
  },
  lejos: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: tinta,
    marginTop: 8,
  },
  enlace: {
    fontFamily: sansMedia,
    color: tueste,
  },
  buscar: {
    fontFamily: sans,
    fontSize: 16,
    color: tinta,
    borderBottomWidth: 1,
    borderBottomColor: linea,
    paddingVertical: 10,
    marginTop: 16,
  },
  riel: {
    gap: 16,
    paddingVertical: 14,
  },
  indice: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 4,
  },
  palabra: {
    fontFamily: sans,
    fontSize: 15,
    color: humo,
  },
  palabraActiva: {
    fontFamily: sansMedia,
    color: tinta,
    textDecorationLine: "underline",
  },
  pasar: {
    fontFamily: serifItalica,
    fontSize: 18,
    color: tueste,
    marginTop: 18,
    marginBottom: 8,
  },
  vacio: {
    fontFamily: serifItalica,
    fontSize: 18,
    color: humo,
    marginTop: 24,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: linea,
  },
  foto: {
    width: 58,
    height: 58,
    borderRadius: 2,
  },
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: sansMedia,
    fontSize: 16,
    color: tinta,
  },
  filaPuntos: {
    fontFamily: sans,
    fontSize: 13,
    color: humo,
    marginTop: 2,
  },
  filaPrecio: {
    fontFamily: serif,
    fontSize: 16,
    color: tinta,
  },
});
