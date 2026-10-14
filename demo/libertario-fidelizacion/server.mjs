import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_HOST = "libertariocoffee.odoo.com";

for (const [key, value] of Object.entries(process.env)) {
  if (
    typeof value === "string" &&
    value.toLowerCase().includes(PRODUCTION_HOST)
  ) {
    console.error(`Demo detenido: ${key} apunta al Odoo de producción.`);
    process.exit(1);
  }
}

const root = fileURLToPath(new URL("./public/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const members = new Map();
const orders = [];
const calls = [];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

const send = (
  response,
  status,
  body,
  type = "application/json; charset=utf-8",
) => {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  response.writeHead(status, {
    "content-type": type,
    "content-length": payload.length,
    "cache-control": "no-store",
  });
  response.end(payload);
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 65_536) {
        reject(Object.assign(new Error("cuerpo-grande"), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("json-invalido"), { status: 400 }));
      }
    });
    request.on("error", reject);
  });

const rejectProduction = (value) => {
  if (
    typeof value === "string" &&
    value.toLowerCase().includes(PRODUCTION_HOST)
  ) {
    throw Object.assign(new Error("produccion-rechazada"), { status: 403 });
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) rejectProduction(nested);
  }
};

const publicMember = (member) => ({
  codigo: member.codigo,
  nombre: member.nombre,
  puntos: member.puntos,
  sellos: member.sellos,
  premio: member.premio,
});

const ensure = (codigo) => {
  const member = members.get(codigo);
  if (!member)
    throw Object.assign(new Error("miembro-desconocido"), { status: 404 });
  return member;
};

const routes = {
  async "POST /api/alta"(body) {
    const nombre = String(body.nombre || "").trim();
    const celular = String(body.celular || "").replace(/\D/g, "");
    const correo = String(body.correo || "").trim();
    const cedula = String(body.cedula || "").replace(/\D/g, "");
    if (nombre.length < 2 || !/^3\d{9}$/.test(celular)) {
      throw Object.assign(new Error("datos-incompletos"), { status: 400 });
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      !/^\d{6,10}$/.test(cedula)
    ) {
      throw Object.assign(new Error("datos-incompletos"), { status: 400 });
    }
    let hash = 0;
    for (const char of cedula) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
    const codigo = `LB-${1000 + (hash % 9000)}`;
    const existing = members.get(codigo);
    const member = existing || {
      codigo,
      nombre,
      celular,
      correo,
      cedula,
      puntos: 860,
      sellos: 3,
      premio: null,
    };
    member.nombre = nombre;
    members.set(codigo, member);
    return {
      ...publicMember(member),
      saldo: "demostracion",
      mensaje: "No se envió SMS ni correo. Este saldo no sale de Odoo.",
    };
  },
  async "POST /api/compra"(body) {
    const member = ensure(String(body.codigo || ""));
    const puntos = Number(body.puntos);
    if (!Number.isInteger(puntos) || puntos < 0 || puntos > 200_000) {
      throw Object.assign(new Error("puntos-invalidos"), { status: 400 });
    }
    member.puntos += puntos;
    member.sellos += 1;
    let premioNuevo = null;
    if (member.sellos >= 8) {
      member.sellos = 0;
      member.premio = "Filtrado PAZ 8 oz";
      premioNuevo = member.premio;
    }
    return { ...publicMember(member), premioNuevo };
  },
  async "POST /api/canje"(body) {
    const member = ensure(String(body.codigo || ""));
    const puntos = Number(body.puntos);
    if (!Number.isInteger(puntos) || puntos <= 0 || member.puntos < puntos) {
      throw Object.assign(new Error("puntos-insuficientes"), { status: 409 });
    }
    member.puntos -= puntos;
    return publicMember(member);
  },
  async "POST /api/premio"(body) {
    const member = ensure(String(body.codigo || ""));
    member.premio = null;
    return publicMember(member);
  },
  async "POST /api/llegada"(body) {
    ensure(String(body.codigo || ""));
    if ("lat" in body || "lng" in body || "coordenadas" in body) {
      throw Object.assign(new Error("coordenada-rechazada"), { status: 400 });
    }
    return {
      sedeId: String(body.sedeId || ""),
      canal: "notificacion-local",
      odoo: "no-recibe-ubicacion",
    };
  },
  async "POST /api/mesa"(body) {
    const member = ensure(String(body.codigo || ""));
    const mesa = Number(body.mesa);
    const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
    if (!Number.isInteger(mesa) || mesa < 1 || mesa > 40) {
      throw Object.assign(new Error("mesa-invalida"), { status: 400 });
    }
    const order = {
      id: `M-${orders.length + 1}`,
      codigo: member.codigo,
      sedeId: String(body.sedeId || ""),
      mesa,
      items,
      pago: "caja",
      creado: new Date().toISOString(),
    };
    orders.push(order);
    return { pedidoId: order.id, pago: "caja", cobraEnLaApp: false };
  },
  async "POST /api/mesero"(body) {
    const member = ensure(String(body.codigo || ""));
    const mesa = Number(body.mesa);
    const call = {
      id: `A-${calls.length + 1}`,
      codigo: member.codigo,
      sedeId: String(body.sedeId || ""),
      mesa,
      pedidoId: body.pedidoId ? String(body.pedidoId) : null,
      creado: new Date().toISOString(),
      sms: false,
    };
    calls.push(call);
    return {
      avisoId: call.id,
      mensaje: `Mesero en camino a la mesa ${mesa}. No se envió SMS.`,
    };
  },
  async "GET /api/salud"() {
    return {
      modo: "mock",
      odoo: "desconectado",
      produccion: "bloqueada",
      miembros: members.size,
      pedidos: orders.length,
      avisos: calls.length,
    };
  },
};

const fileFor = (urlPath) => {
  let decoded = urlPath.split("?")[0];
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  const relative = normalize(decoded).replace(/^[/\\]+/, "");
  if (relative.startsWith("..") || relative.includes(`${sep}..`)) return null;
  const file = join(root, relative);
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (!file.startsWith(prefix)) return null;
  return file;
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}`);
    const key = `${request.method} ${url.pathname}`;
    if (routes[key]) {
      const body = request.method === "POST" ? await readBody(request) : {};
      rejectProduction(body);
      const result = await routes[key](body, url);
      send(response, 200, JSON.stringify(result));
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      send(response, 404, JSON.stringify({ error: "no-encontrado" }));
      return;
    }
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = fileFor(requested);
    if (!file) {
      send(response, 403, "ruta rechazada", "text/plain; charset=utf-8");
      return;
    }
    const bytes = await readFile(file);
    send(
      response,
      200,
      bytes,
      types[extname(file)] || "application/octet-stream",
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      send(response, 404, "no está", "text/plain; charset=utf-8");
      return;
    }
    const status = error.status || 500;
    send(response, status, JSON.stringify({ error: error.message || "error" }));
  }
});

server.listen(port, host, () => {
  console.log(`Demo Libertario en http://${host}:${port}`);
  console.log("Mock local. No llama a Odoo. No envía SMS ni correo.");
});
