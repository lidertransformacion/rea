import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { piezaDe } from "@/src/datos/carta";
import {
  BONO_BIENVENIDA,
  esTaza,
  PREMIOS,
  SEDE_INICIAL,
  sedePorId,
  TAZAS_PARA_FILTRADO,
  puntosDePrecio,
  type Premio,
} from "@/src/datos/programa";

const CLAVE = "libertario-casa-v1";

export type Movimiento = {
  id: string;
  fecha: string;
  concepto: string;
  sede: string | null;
  puntos: number;
};

export type LineaMesa = {
  itemId: string;
  cantidad: number;
};

export type Cuenta = {
  version: 1;
  nombre: string;
  celular: string;
  correo: string;
  cedula: string;
  codigo: string;
  puntos: number;
  sellos: number;
  sedeId: string;
  mesa: string;
  comanda: LineaMesa[];
  movimientos: Movimiento[];
};

export type Alta = {
  nombre: string;
  celular: string;
  correo: string;
  cedula: string;
};

type Brasa = { linea: string } | null;

type Api = {
  lista: boolean;
  cuenta: Cuenta | null;
  nota: string | null;
  brasa: Brasa;
  entrar: (alta: Alta) => void;
  elegirSede: (id: string) => void;
  fijarMesa: (mesa: string) => void;
  anotarPieza: (itemId: string) => void;
  sumarMesa: (itemId: string) => void;
  quitarMesa: (itemId: string) => void;
  anotarComanda: () => void;
  avisarSala: () => void;
  canjear: (premioId: string) => void;
  olvidar: () => void;
  cerrarNota: () => void;
};

const Contexto = createContext<Api | null>(null);

function mover(
  concepto: string,
  puntos: number,
  sede: string | null,
): Movimiento {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: new Date().toISOString(),
    concepto,
    sede,
    puntos,
  };
}

function codigoDe(cedula: string): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let extra = "";
  for (let i = 0; i < 3; i += 1) {
    extra += alfabeto[Math.floor(Math.random() * alfabeto.length)] ?? "L";
  }
  return `LBT-${cedula.slice(-4)}-${extra}`;
}

function crear(alta: Alta): Cuenta {
  return {
    version: 1,
    nombre: alta.nombre.trim(),
    celular: alta.celular.trim(),
    correo: alta.correo.trim(),
    cedula: alta.cedula.trim(),
    codigo: codigoDe(alta.cedula.trim()),
    puntos: BONO_BIENVENIDA,
    sellos: 0,
    sedeId: SEDE_INICIAL,
    mesa: "4",
    comanda: [],
    movimientos: [mover("Bono de bienvenida", BONO_BIENVENIDA, null)],
  };
}

function esCuenta(valor: unknown): valor is Cuenta {
  if (!valor || typeof valor !== "object") return false;
  const cuenta = valor as Partial<Cuenta>;
  return (
    cuenta.version === 1 &&
    typeof cuenta.codigo === "string" &&
    typeof cuenta.puntos === "number"
  );
}

function aplicarTazas(
  sellos: number,
  tazas: number,
): { sellos: number; octavas: number } {
  let van = sellos;
  let octavas = 0;
  for (let i = 0; i < tazas; i += 1) {
    van += 1;
    if (van >= TAZAS_PARA_FILTRADO) {
      octavas += 1;
      van = 0;
    }
  }
  return { sellos: van, octavas };
}

export function CuentaProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [lista, setLista] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [brasa, setBrasa] = useState<Brasa>(null);

  useEffect(() => {
    let vivo = true;
    void AsyncStorage.getItem(CLAVE).then((crudo) => {
      if (!vivo) return;
      if (crudo) {
        try {
          const leida: unknown = JSON.parse(crudo);
          if (esCuenta(leida)) setCuenta(leida);
        } catch {
          setCuenta(null);
        }
      }
      setLista(true);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const guardar = useCallback((siguiente: Cuenta) => {
    setCuenta(siguiente);
    void AsyncStorage.setItem(CLAVE, JSON.stringify(siguiente));
  }, []);

  const encender = useCallback((linea: string) => {
    setBrasa({ linea });
    const espera = linea ? 2100 : 1500;
    setTimeout(() => setBrasa(null), espera);
  }, []);

  const entrar = useCallback(
    (alta: Alta) => {
      const nueva = crear(alta);
      guardar(nueva);
      setNota("El bono de bienvenida ya está: 1.000 puntos.");
    },
    [guardar],
  );

  const elegirSede = useCallback(
    (id: string) => {
      if (!cuenta) return;
      guardar({ ...cuenta, sedeId: id });
    },
    [cuenta, guardar],
  );

  const fijarMesa = useCallback(
    (mesa: string) => {
      if (!cuenta) return;
      guardar({ ...cuenta, mesa: mesa.replace(/\D/g, "").slice(0, 3) });
    },
    [cuenta, guardar],
  );

  const cerrarCompra = useCallback(
    (
      actual: Cuenta,
      items: { nombre: string; precio: number; categoria: string }[],
      comanda: LineaMesa[],
    ) => {
      const sede = sedePorId(actual.sedeId).etiqueta;
      let puntos = actual.puntos;
      let sellos = actual.sellos;
      const movimientos = [...actual.movimientos];
      let tazas = 0;
      for (const item of items) {
        const ganados = puntosDePrecio(item.precio);
        puntos += ganados;
        movimientos.unshift(mover(item.nombre, ganados, sede));
        if (esTaza(item.categoria)) tazas += 1;
      }
      const aplicado = aplicarTazas(sellos, tazas);
      for (let i = 0; i < aplicado.octavas; i += 1) {
        movimientos.unshift(mover("Octava taza · Filtrado Paz", 0, sede));
      }
      guardar({
        ...actual,
        puntos,
        sellos: aplicado.sellos,
        movimientos,
        comanda,
      });
      if (aplicado.octavas > 0) encender("La octava taza. Un filtrado Paz.");
      else if (tazas > 0) encender("");
    },
    [encender, guardar],
  );

  const anotarPieza = useCallback(
    (itemId: string) => {
      if (!cuenta) return;
      const pieza = piezaDe(itemId);
      if (!pieza) return;
      cerrarCompra(cuenta, [pieza], cuenta.comanda);
      setNota(
        `${pieza.nombre} quedó anotada en la caja. No se cobró: este demo no cobra.`,
      );
    },
    [cerrarCompra, cuenta],
  );

  const sumarMesa = useCallback(
    (itemId: string) => {
      if (!cuenta) return;
      const comanda = cuenta.comanda.map((linea) => ({ ...linea }));
      const linea = comanda.find((item) => item.itemId === itemId);
      if (linea) linea.cantidad += 1;
      else comanda.push({ itemId, cantidad: 1 });
      guardar({ ...cuenta, comanda });
    },
    [cuenta, guardar],
  );

  const quitarMesa = useCallback(
    (itemId: string) => {
      if (!cuenta) return;
      const comanda = cuenta.comanda
        .map((linea) =>
          linea.itemId === itemId
            ? { ...linea, cantidad: linea.cantidad - 1 }
            : linea,
        )
        .filter((linea) => linea.cantidad > 0);
      guardar({ ...cuenta, comanda });
    },
    [cuenta, guardar],
  );

  const anotarComanda = useCallback(() => {
    if (!cuenta) return;
    const items = cuenta.comanda.flatMap((linea) => {
      const pieza = piezaDe(linea.itemId);
      if (!pieza) return [];
      return Array.from({ length: linea.cantidad }, () => pieza);
    });
    if (items.length === 0) {
      setNota("La mesa está vacía.");
      return;
    }
    cerrarCompra(cuenta, items, []);
    setNota(
      "La comanda pasó al mostrador. El cobro, en la caja. Aquí solo se anotaron los puntos.",
    );
  }, [cerrarCompra, cuenta]);

  const avisarSala = useCallback(() => {
    if (!cuenta) return;
    const sede = sedePorId(cuenta.sedeId);
    setNota(
      `Quedó el aviso de la mesa ${cuenta.mesa || "—"} en ${sede.nombre}. No sale de este teléfono.`,
    );
  }, [cuenta]);

  const canjear = useCallback(
    (premioId: string) => {
      if (!cuenta) return;
      const premio: Premio | undefined = PREMIOS.find(
        (item) => item.id === premioId,
      );
      if (!premio) return;
      if (cuenta.puntos < premio.puntos) {
        setNota(
          `Faltan ${(premio.puntos - cuenta.puntos).toLocaleString("es-CO")} puntos para ${premio.nombre}. Se cambia entero.`,
        );
        return;
      }
      const sede = sedePorId(cuenta.sedeId).etiqueta;
      guardar({
        ...cuenta,
        puntos: cuenta.puntos - premio.puntos,
        movimientos: [
          mover(`Canje · ${premio.nombre}`, -premio.puntos, sede),
          ...cuenta.movimientos,
        ],
      });
      setNota(
        `${premio.nombre} quedó pedido. Se descontaron ${premio.puntos.toLocaleString("es-CO")} puntos. Se recoge en caja.`,
      );
    },
    [cuenta, guardar],
  );

  const olvidar = useCallback(() => {
    setCuenta(null);
    setNota(null);
    void AsyncStorage.removeItem(CLAVE);
  }, []);

  const cerrarNota = useCallback(() => setNota(null), []);

  const valor = useMemo<Api>(
    () => ({
      lista,
      cuenta,
      nota,
      brasa,
      entrar,
      elegirSede,
      fijarMesa,
      anotarPieza,
      sumarMesa,
      quitarMesa,
      anotarComanda,
      avisarSala,
      canjear,
      olvidar,
      cerrarNota,
    }),
    [
      anotarComanda,
      anotarPieza,
      avisarSala,
      brasa,
      canjear,
      cerrarNota,
      cuenta,
      elegirSede,
      entrar,
      fijarMesa,
      lista,
      nota,
      olvidar,
      quitarMesa,
      sumarMesa,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCuenta(): Api {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("La cuenta no está en el árbol.");
  return valor;
}
