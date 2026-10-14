const KEY = "libertario-fidelizacion-demo";
const NAV = ["casa", "menu", "llegada", "mesa"];

const sedes = [
  {
    id: "zona-g",
    nombre: "Zona G",
    direccion: "Calle 70A # 5-37",
    horario: "Lun a sáb 7:00–19:30 · Dom 8:00–18:00",
    x: 32,
    y: 76,
    promo: {
      itemId: "fil-rock-12",
      titulo: "Filtrado ROCK 12 oz",
      precio: 19700,
      minutos: 45,
      texto: "Al entrar, el ROCK de 12 oz queda en $19.700 durante 45 minutos.",
    },
  },
  {
    id: "parque-93",
    nombre: "Parque 93",
    direccion: "Calle 93 # 11-49",
    horario: "Lun a sáb 7:00–19:30 · Dom 8:00–18:00",
    x: 48,
    y: 50,
    promo: {
      itemId: "croix-pistacho",
      titulo: "Croissant de pistacho",
      precio: 12800,
      minutos: 45,
      texto: "El pistacho baja a $12.800 en esta visita.",
    },
  },
  {
    id: "calle-85",
    nombre: "Calle 85",
    direccion: "Carrera 13 # 85-13",
    horario: "Lun a sáb 7:00–19:30 · Dom 8:00–18:00",
    x: 30,
    y: 62,
    promo: {
      itemId: "tos-caprese",
      titulo: "Tostada caprese",
      precio: 19900,
      minutos: 45,
      texto: "La caprese queda en $19.900 al llegar.",
    },
  },
  {
    id: "usaquen",
    nombre: "Usaquén",
    direccion: "Calle 119B # 5-43",
    horario: "Lun a mié 7:30–19:30 · Jue a sáb hasta 21:00",
    x: 74,
    y: 28,
    promo: {
      itemId: "cb-lata",
      titulo: "Cold brew en lata",
      precio: 9800,
      minutos: 45,
      texto: "La lata queda en $9.800 durante esta visita.",
    },
  },
  {
    id: "flagship-122",
    nombre: "Flagship 122",
    direccion: "Calle 122 # 18B-70",
    horario: "Lun a sáb 7:00–19:30 · Dom 8:00–18:00",
    x: 52,
    y: 18,
    promo: {
      itemId: "matcha-latte",
      titulo: "Matcha latte",
      precio: 12500,
      minutos: 45,
      texto: "El matcha latte queda en $12.500 al llegar.",
    },
  },
];

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const state = {
  screen: "bienvenida",
  member: null,
  sedeId: "zona-g",
  llegada: null,
  mesa: null,
  carta: null,
  q: "",
  categoria: "todas",
  precio: "todas",
  soloMios: false,
  vegano: false,
  sort: "carta",
  productId: null,
  filling: null,
  modal: null,
  arriving: null,
};

const $ = (tag, props = {}, ...kids) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value != null && value !== false)
      node.setAttribute(key, String(value));
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    node.append(
      kid instanceof Node ? kid : document.createTextNode(String(kid)),
    );
  }
  return node;
};

const sede = () => sedes.find((item) => item.id === state.sedeId) || sedes[0];
const money = (value) => pesos.format(value).replace("COP", "").trim();
const norm = (value) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const itemById = (id) => state.carta?.items.find((item) => item.id === id);

const promoFor = (item) => {
  if (!state.llegada || state.llegada.sedeId !== state.sedeId) return null;
  if (state.llegada.expira < Date.now()) return null;
  const current = sede();
  if (current.promo.itemId !== item.id) return null;
  return current.promo;
};

const priceOf = (item) => promoFor(item)?.precio ?? item.precio;

const save = () => {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      member: state.member,
      sedeId: state.sedeId,
      llegada: state.llegada,
      mesa: state.mesa,
    }),
  );
};

const load = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!stored?.member) return;
    Object.assign(state, {
      member: stored.member,
      sedeId: stored.sedeId || state.sedeId,
      llegada: stored.llegada,
      mesa: stored.mesa,
      screen: "casa",
    });
  } catch {
    localStorage.removeItem(KEY);
  }
};

const toast = (text) => {
  const node = document.getElementById("toast");
  node.textContent = text;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
};

const api = async (path, body) => {
  const response = await fetch(path, {
    method: path === "/api/salud" ? "GET" : "POST",
    headers: { "content-type": "application/json" },
    body: path === "/api/salud" ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "api");
  return payload;
};

const syncMember = (payload) => {
  if (!state.member || payload?.puntos == null) return;
  state.member.puntos = payload.puntos;
  state.member.sellos = payload.sellos;
  state.member.premio = payload.premio;
  save();
};

const go = (screen, { replace = false } = {}) => {
  state.screen = screen;
  const hash = `#${screen}`;
  if (replace) history.replaceState({ screen }, "", hash);
  else history.pushState({ screen }, "", hash);
  paint();
};

const back = () => {
  if (history.length > 1) history.back();
  else go("casa", { replace: true });
};

const paint = () => {
  const app = document.getElementById("app");
  const next = $("div", { class: "screen" });
  next.append(views[state.screen]?.() || views.casa());
  const previous = [...app.querySelectorAll(".screen")];
  app.append(next);
  requestAnimationFrame(() => next.classList.add("active"));
  for (const node of previous) {
    node.classList.remove("active");
    node.classList.add("leave");
    setTimeout(() => node.remove(), 380);
  }
  for (const overlay of document.querySelectorAll(".overlay")) overlay.remove();
  const modal = modalNode();
  if (modal) document.getElementById("device").append(modal);
  const nav = NAV.includes(state.screen);
  let bar = document.querySelector(".nav");
  if (nav && state.member) {
    if (!bar) {
      bar = navBar();
      document.getElementById("device").append(bar);
    }
    for (const button of bar.querySelectorAll("button")) {
      button.classList.toggle("on", button.dataset.screen === state.screen);
    }
  } else if (bar) bar.remove();
};

const navBar = () =>
  $(
    "nav",
    { class: "nav" },
    [
      ["casa", "Casa"],
      ["menu", "Menú"],
      ["llegada", "Llegada"],
      ["mesa", "Mesa"],
    ].map(([id, label]) =>
      $("button", {
        type: "button",
        "data-screen": id,
        class: state.screen === id ? "on" : "",
        text: label,
        onclick: () => go(id),
      }),
    ),
  );

const greeting = () => {
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const first = state.member.nombre.split(" ")[0];
  return `${hello}, ${first}`;
};

const stamps = (count, filling) =>
  $(
    "div",
    { class: "stamps", "aria-label": `${count} de 8 sellos` },
    Array.from({ length: 8 }, (_, index) =>
      $("span", {
        class: `stamp${index < count ? " filled" : ""}${index === filling ? " filling" : ""}`,
      }),
    ),
  );

const passCard = () => {
  const member = state.member;
  return $("article", { class: "pass" }, [
    $("div", { class: "pass-head" }, [
      $("div", { class: "row" }, [
        $("span", { class: "mark", text: "L" }),
        $("div", {}, [
          $("span", { class: "word", text: "LIBERTARIO" }),
          $("span", { class: "sub", text: "Coffee Roasters" }),
        ]),
      ]),
      $("span", { class: "level", text: "Casa" }),
    ]),
    $("p", { class: "who", text: member.nombre }),
    $("p", { class: "points" }, [
      $("b", { text: String(member.puntos) }),
      " pts",
    ]),
    $("p", { class: "eq", text: `${money(member.puntos * 100)} de la carta` }),
    stamps(member.sellos, state.filling),
    $("div", { class: "pass-foot" }, [
      $("span", { text: member.codigo }),
      $("span", { text: `${member.sellos}/8` }),
    ]),
  ]);
};

const views = {
  bienvenida() {
    return $(
      "section",
      { class: "hero", style: "--hero:url(/assets/cafe.jpg)" },
      [
        $("p", { class: "wordmark", text: "LIBERTARIO" }),
        $("p", { class: "lede", text: "El café es nuestra brújula." }),
        $("p", {
          class: "fine",
          text: "La libertad no es un destino. La celebramos, taza a taza. Tu tarjeta, tus sellos y el menú de la sede.",
        }),
        $("button", {
          class: "solid light",
          type: "button",
          text: "Crear mi tarjeta",
          onclick: () => go("alta"),
        }),
      ],
    );
  },
  alta() {
    const form = $("form", { class: "pad solo" });
    const error = $("p", { class: "err" });
    const fields = [
      ["nombre", "Nombre", "text", "Tu nombre"],
      ["celular", "Celular", "tel", "300 000 0000"],
      ["correo", "Correo", "email", "tu@correo.com"],
      ["cedula", "Cédula", "text", "Sin puntos"],
    ];
    const inputs = {};
    form.append(
      $("button", {
        class: "back",
        type: "button",
        text: "←",
        onclick: () => go("bienvenida"),
      }),
      $("p", { class: "kicker", text: "Un solo paso" }),
      $("h1", { text: "Tu tarjeta" }),
      $("p", {
        class: "lede",
        text: "Celular, correo, nombre y cédula. Nada más.",
      }),
    );
    for (const [name, label, type, placeholder] of fields) {
      const input = $("input", {
        name,
        type,
        placeholder,
        autocomplete: "on",
        required: true,
      });
      inputs[name] = input;
      form.append(
        $("label", { class: "field" }, $("span", { text: label }), input),
      );
    }
    form.append(
      error,
      $("button", { class: "solid", type: "submit", text: "Entrar" }),
      $("p", {
        class: "meta",
        text: "No enviamos SMS ni correo. El código de caja queda en la tarjeta. El saldo inicial es de demostración.",
      }),
    );
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nombre = inputs.nombre.value.trim();
      const celular = inputs.celular.value
        .replace(/\D/g, "")
        .replace(/^57/, "");
      const correo = inputs.correo.value.trim();
      const cedula = inputs.cedula.value.replace(/\D/g, "");
      if (nombre.length < 2) return showError(error, "Escribe tu nombre.");
      if (!/^3\d{9}$/.test(celular))
        return showError(error, "El celular tiene 10 dígitos y empieza por 3.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
        return showError(error, "Revisa el correo.");
      if (!/^\d{6,10}$/.test(cedula))
        return showError(error, "La cédula va de 6 a 10 dígitos.");
      error.textContent = "";
      try {
        const member = await api("/api/alta", {
          nombre,
          celular,
          correo,
          cedula,
        });
        state.member = {
          nombre,
          celular,
          correo,
          cedula,
          codigo: member.codigo,
          puntos: member.puntos,
          sellos: member.sellos,
          premio: member.premio,
        };
        save();
        toast("Tarjeta lista. Muéstrala antes de pagar.");
        go("casa");
      } catch {
        showError(error, "No se pudo guardar en el demo local.");
      }
    });
    return form;
  },
  casa() {
    const current = sede();
    const open = state.mesa?.items?.length || 0;
    const promo =
      state.llegada && state.llegada.expira > Date.now()
        ? sedeById(state.llegada.sedeId)
        : null;
    return $("section", { class: "pad" }, [
      $("p", { class: "kicker", text: current.nombre }),
      $("h1", { text: greeting() }),
      $("p", {
        class: "meta",
        text: "Saldo de demostración. Un punto visible son $100 de la carta.",
      }),
      passCard(),
      promo &&
        $("div", { class: "banner" }, [
          $("span", { class: "clock", text: clock(promo) }),
          $("p", { text: `${promo.nombre}. ${promo.promo.texto}` }),
        ]),
      state.member.premio &&
        $("div", { class: "banner" }, [
          $("strong", { text: "Premio en caja" }),
          $("p", { text: state.member.premio }),
          $("button", {
            class: "solid light",
            type: "button",
            text: "Ya lo reclamé en caja",
            onclick: claimPrize,
          }),
        ]),
      $("div", { class: "grid-2" }, [
        $(
          "button",
          { class: "tile", type: "button", onclick: () => go("menu") },
          [$("strong", { text: "Menú" }), $("span", { text: current.nombre })],
        ),
        $(
          "button",
          { class: "tile", type: "button", onclick: () => go("llegada") },
          [
            $("strong", { text: "Llegué" }),
            $("span", { text: "Promo de la sede" }),
          ],
        ),
        $(
          "button",
          { class: "tile", type: "button", onclick: () => go("mesa") },
          [
            $("strong", { text: "Mesa" }),
            $("span", { text: open ? `${open} en la comanda` : "QR sin pago" }),
          ],
        ),
        $(
          "button",
          { class: "tile", type: "button", onclick: () => go("tarjeta") },
          [
            $("strong", { text: "Tarjeta" }),
            $("span", { text: state.member.codigo }),
          ],
        ),
      ]),
      $("button", {
        class: "ghost ink",
        type: "button",
        text: "Registrar una compra de caja",
        onclick: () => {
          state.modal = "compra";
          paint();
        },
      }),
    ]);
  },
  tarjeta() {
    return $("section", { class: "pad solo" }, [
      $("div", { class: "topbar" }, [
        $("button", {
          class: "back",
          type: "button",
          text: "←",
          onclick: back,
        }),
        $("p", { class: "kicker", text: "Pase local" }),
      ]),
      $("h2", { text: "Así se ve tu tarjeta" }),
      $("p", {
        class: "lede",
        text: "Apple Wallet y Google Wallet siguen pendientes. No hay pase firmado ni deploy. Esta es la vista en el teléfono.",
      }),
      passCard(),
      $("p", {
        class: "lede",
        text: "Ocho sellos. El octavo es un filtrado PAZ de 8 oz, en caja, y la tira vuelve a cero. Los puntos salen del gasto: lo que pagas con puntos no vuelve a sumar.",
      }),
      $("button", {
        class: "ghost ink",
        type: "button",
        text: "Cerrar sesión de este demo",
        onclick: () => {
          localStorage.removeItem(KEY);
          state.member = null;
          state.mesa = null;
          state.llegada = null;
          go("bienvenida", { replace: true });
        },
      }),
    ]);
  },
  llegada() {
    return $("section", { class: "pad" }, [
      $("p", { class: "kicker", text: "Geocerca local" }),
      $("h2", { text: "Llegar a la sede" }),
      $("p", {
        class: "lede",
        text: "En el teléfono real el aviso sale al entrar al radio. Aquí simulas la llegada. La coordenada no se envía.",
      }),
      mapNode(),
      $("p", {
        class: "meta",
        text: "Mapa ilustrado de Bogotá. No es un GPS.",
      }),
      ...sedes.map((item) =>
        $(
          "button",
          {
            class: `sede${item.id === state.sedeId ? " on" : ""}`,
            type: "button",
            onclick: () => arrive(item.id),
          },
          [
            $("b", { text: item.nombre }),
            $("span", {
              class: "meta",
              text: `${item.direccion}. ${item.promo.texto}`,
            }),
          ],
        ),
      ),
    ]);
  },
  menu() {
    const current = sede();
    const cats = state.carta.categorias;
    const promo =
      state.llegada &&
      state.llegada.expira > Date.now() &&
      state.llegada.sedeId === current.id
        ? current.promo
        : null;
    const section = $("section", { class: "pad" });
    const list = $("div", { class: "list" });
    const input = $("input", {
      class: "search",
      type: "search",
      placeholder: "Buscar en la carta",
      value: state.q,
      "aria-label": "Buscar",
    });
    input.addEventListener("input", () => {
      state.q = input.value;
      fillList(list);
    });
    section.append(
      $("p", { class: "kicker", text: `Menú · ${current.nombre}` }),
      $("h2", { text: current.nombre }),
      $("p", { class: "meta", text: state.carta.fuente }),
      promo &&
        $("div", { class: "banner" }, [
          $("span", { class: "clock", text: clock(current) }),
          $("p", { text: promo.texto }),
          $("button", {
            class: "solid light",
            type: "button",
            text: promo.titulo,
            onclick: () => {
              state.productId = promo.itemId;
              go("producto");
            },
          }),
        ]),
      input,
      $("div", { class: "chips" }, [
        chip("todas", "Todo", "categoria"),
        ...cats.map((cat) => chip(cat.id, cat.nombre, "categoria")),
      ]),
      $("div", { class: "prices" }, [
        chip("todas", "Cualquier precio", "precio"),
        chip("bajo", "Hasta $15.000", "precio"),
        chip("medio", "$15 a $30 mil", "precio"),
        chip("alto", "Más de $30.000", "precio"),
        toggle("soloMios", "Con mis puntos"),
        toggle("vegano", "Vegetal"),
      ]),
      $("div", { class: "prices" }, [
        chip("carta", "Orden de carta", "sort"),
        chip("precio-asc", "Menor precio", "sort"),
        chip("precio-desc", "Mayor precio", "sort"),
        chip("nombre", "Nombre", "sort"),
      ]),
      list,
    );
    fillList(list);
    return section;
  },
  producto() {
    const item = itemById(state.productId);
    if (!item) return views.menu();
    const promo = promoFor(item);
    const foto = photoOf(item);
    const short = state.member.puntos < item.puntos;
    return $("section", {}, [
      $(
        "div",
        { class: "photo-head", style: `background-image:url(/assets/${foto})` },
        [
          $("button", {
            class: "back",
            type: "button",
            text: "←",
            onclick: back,
          }),
        ],
      ),
      $("div", { class: "sheet" }, [
        $("p", { class: "kicker", text: categoryName(item.categoria) }),
        $("h2", { text: item.nombre }),
        $("p", { class: "lede", text: item.descripcion }),
        $("p", { class: "points" }, [
          promo ? $("span", { class: "was", text: money(item.precio) }) : null,
          $("b", { text: money(priceOf(item)) }),
        ]),
        $("p", {
          class: "meta",
          text: promo
            ? "Precio de esta llegada, solo en caja."
            : `${item.puntos} pts para canjearlo`,
        }),
        $("div", { class: "actions" }, [
          $("button", {
            class: "solid",
            type: "button",
            disabled: short,
            text: short
              ? `Te faltan ${item.puntos - state.member.puntos} pts`
              : `Canjear · ${item.puntos} pts`,
            onclick: () => redeem(item),
          }),
          $("button", {
            class: "ghost ink",
            type: "button",
            text: "Sumar a la mesa",
            onclick: () => addToTable(item, false),
          }),
          $("button", {
            class: "ghost ink",
            type: "button",
            text: "Ya lo pagué en caja",
            onclick: () => buy(item),
          }),
        ]),
      ]),
    ]);
  },
  mesa() {
    const current = sede();
    if (!state.mesa || state.mesa.sedeId !== current.id) {
      state.mesa = {
        sedeId: current.id,
        numero: state.mesa?.numero || 12,
        items: [],
        pedidoId: null,
      };
    }
    const mesa = state.mesa;
    const total = mesa.items.reduce(
      (sum, line) => sum + (line.canje ? 0 : line.precio * line.qty),
      0,
    );
    const box = $("div", { class: "qr-box" });
    box.innerHTML = qrMarkup(
      `libertario-demo://mesa/${mesa.numero}?sede=${current.id}`,
    );
    return $("section", { class: "pad" }, [
      $("p", { class: "kicker", text: current.nombre }),
      $("h2", { text: `Mesa ${mesa.numero}` }),
      $("p", {
        class: "lede",
        text: "El QR abre la carta de esta mesa. El pedido no cobra. Pagas en caja.",
      }),
      box,
      $("div", { class: "stepper" }, [
        $("button", {
          type: "button",
          text: "–",
          onclick: () => changeTable(-1),
        }),
        $("strong", { class: "serif", text: `Mesa ${mesa.numero}` }),
        $("button", {
          type: "button",
          text: "+",
          onclick: () => changeTable(1),
        }),
      ]),
      $("button", {
        class: "solid",
        type: "button",
        text: "Leer este QR",
        onclick: () => {
          toast(`Mesa ${mesa.numero} en ${current.nombre}. Sin pago.`);
          go("menu");
        },
      }),
      $(
        "div",
        { class: "ticket" },
        mesa.items.length
          ? mesa.items.map((line) =>
              $("div", { class: "ticket-row" }, [
                $("span", {
                  text: `${line.qty} · ${line.nombre}${line.canje ? " · canje" : ""}`,
                }),
                $("span", {
                  text: line.canje ? "$0" : money(line.precio * line.qty),
                }),
              ]),
            )
          : $("p", { class: "empty", text: "La comanda está vacía." }),
      ),
      $("p", { class: "lede", text: `En caja: ${money(total)}` }),
      $("div", { class: "actions" }, [
        $("button", {
          class: "ghost ink",
          type: "button",
          text: "Llamar al mesero",
          onclick: callWaiter,
        }),
        mesa.items.length
          ? $("button", {
              class: "solid",
              type: "button",
              text: "Marcar cobrado en caja",
              onclick: settle,
            })
          : null,
      ]),
    ]);
  },
};

const showError = (node, text) => {
  node.textContent = text;
};

const sedeById = (id) => sedes.find((item) => item.id === id);

const categoryName = (id) =>
  state.carta.categorias.find((cat) => cat.id === id)?.nombre || id;

const photoOf = (item) =>
  state.carta.categorias.find((cat) => cat.id === item.categoria)?.foto ||
  "cafe.jpg";

const chip = (id, label, key) =>
  $("button", {
    class: `chip${state[key] === id ? " on" : ""}`,
    type: "button",
    text: label,
    onclick: () => {
      state[key] = id;
      paint();
    },
  });

const toggle = (key, label) =>
  $("button", {
    class: `chip${state[key] ? " on" : ""}`,
    type: "button",
    text: label,
    onclick: () => {
      state[key] = !state[key];
      paint();
    },
  });

const filtered = () => {
  const query = norm(state.q.trim());
  let items = state.carta.items.filter((item) => {
    if (state.categoria !== "todas" && item.categoria !== state.categoria)
      return false;
    if (state.precio === "bajo" && item.precio > 15000) return false;
    if (
      state.precio === "medio" &&
      (item.precio <= 15000 || item.precio > 30000)
    )
      return false;
    if (state.precio === "alto" && item.precio <= 30000) return false;
    if (state.soloMios && item.puntos > state.member.puntos) return false;
    if (state.vegano && !item.vegano) return false;
    if (!query) return true;
    return norm(
      `${item.nombre} ${item.descripcion} ${item.perfil || ""}`,
    ).includes(query);
  });
  if (state.sort === "precio-asc")
    items = items.toSorted((a, b) => a.precio - b.precio);
  if (state.sort === "precio-desc")
    items = items.toSorted((a, b) => b.precio - a.precio);
  if (state.sort === "nombre")
    items = items.toSorted((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return items;
};

const fillList = (list) => {
  const items = filtered();
  const promoId =
    state.llegada && state.llegada.expira > Date.now()
      ? sede().promo.itemId
      : null;
  const promoIndex = items.findIndex((item) => item.id === promoId);
  if (promoIndex > 0) items.unshift(items.splice(promoIndex, 1)[0]);
  const nodes = items.length
    ? items.map((item) => {
        const promo = promoFor(item);
        return $(
          "button",
          {
            class: "item",
            type: "button",
            onclick: () => {
              state.productId = item.id;
              go("producto");
            },
          },
          [
            $("img", { src: `/assets/${photoOf(item)}`, alt: "" }),
            $("span", {}, [
              $("b", { text: item.nombre }),
              $("small", { text: item.descripcion }),
              $("span", { class: "price-line" }, [
                $("span", {}, [
                  promo
                    ? $("span", { class: "was", text: money(item.precio) })
                    : null,
                  money(priceOf(item)),
                ]),
                $("span", { text: `${item.puntos} pts` }),
              ]),
            ]),
            promo ? $("span", { class: "flag", text: "Llegada" }) : null,
          ],
        );
      })
    : [$("p", { class: "empty", text: "Nada con ese filtro." })];
  list.replaceChildren(...nodes);
};

const mapNode = () =>
  $(
    "div",
    { class: "map-wrap", "aria-hidden": "true" },
    sedes.map((item) =>
      $(
        "span",
        {
          class: `pin${item.id === state.arriving ? " arriving" : ""}${item.id === state.sedeId ? " on" : ""}`,
          style: `left:${item.x}%;top:${item.y}%`,
        },
        $("span", { class: "halo" }),
      ),
    ),
  );

const clock = (item) => {
  const left = Math.max(0, state.llegada.expira - Date.now());
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return `${item.nombre} · ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const arrive = async (id) => {
  state.arriving = id;
  state.sedeId = id;
  state.q = "";
  state.categoria = "todas";
  state.precio = "todas";
  state.soloMios = false;
  state.vegano = false;
  const item = sedeById(id);
  state.llegada = {
    sedeId: id,
    expira: Date.now() + item.promo.minutos * 60 * 1000,
  };
  save();
  paint();
  toast(`${item.nombre}. ${item.promo.texto}`);
  try {
    await api("/api/llegada", { codigo: state.member.codigo, sedeId: id });
  } catch {
    toast(
      "La llegada quedó en el teléfono. El servidor de prueba no guardó la sede.",
    );
  }
  setTimeout(() => go("menu"), 900);
};

const buy = async (item) => {
  const before = state.member.sellos;
  state.member.puntos += item.puntos;
  state.member.sellos = before + 1;
  state.filling = before;
  state.modal = null;
  save();
  go("casa", { replace: state.screen === "casa" });
  toast(`Caja: ${item.nombre}. +${item.puntos} pts y un sello.`);
  const completed = state.member.sellos >= 8;
  try {
    const payload = await api("/api/compra", {
      codigo: state.member.codigo,
      puntos: item.puntos,
      itemId: item.id,
    });
    if (completed) {
      state.member.sellos = payload.sellos;
      state.member.premio = payload.premio;
      state.filling = null;
      save();
      setTimeout(() => {
        state.modal = "premio";
        paint();
      }, 900);
      return;
    }
  } catch {
    if (completed) {
      state.member.sellos = 0;
      state.member.premio = "Filtrado PAZ 8 oz";
    }
  }
  setTimeout(() => {
    state.filling = null;
    if (state.screen === "casa") paint();
  }, 800);
};

const redeem = async (item) => {
  if (state.member.puntos < item.puntos) return;
  state.member.puntos -= item.puntos;
  save();
  state.modal = { kind: "canje", item };
  paint();
  try {
    syncMember(
      await api("/api/canje", {
        codigo: state.member.codigo,
        puntos: item.puntos,
        itemId: item.id,
      }),
    );
    save();
  } catch {
    toast("El canje quedó en este teléfono.");
  }
};

const claimPrize = async () => {
  state.member.premio = null;
  save();
  paint();
  toast("Premio marcado. Se entrega en caja, sin cobro.");
  try {
    syncMember(await api("/api/premio", { codigo: state.member.codigo }));
    save();
  } catch {
    /* el premio ya se limpió en el teléfono */
  }
};

const addToTable = (item, canje) => {
  const current = sede();
  if (!state.mesa || state.mesa.sedeId !== current.id) {
    state.mesa = { sedeId: current.id, numero: 12, items: [], pedidoId: null };
  }
  const precio = canje ? 0 : priceOf(item);
  const existing = state.mesa.items.find(
    (line) => line.id === item.id && line.canje === canje,
  );
  if (existing) existing.qty += 1;
  else
    state.mesa.items.push({
      id: item.id,
      nombre: item.nombre,
      precio,
      qty: 1,
      canje,
      puntos: item.puntos,
    });
  save();
  toast(
    canje
      ? `${item.nombre} va en la comanda a $0.`
      : `${item.nombre} en la mesa ${state.mesa.numero}. Pagas en caja.`,
  );
  go("mesa");
};

const changeTable = (delta) => {
  state.mesa.numero = Math.min(40, Math.max(1, state.mesa.numero + delta));
  state.mesa.pedidoId = null;
  save();
  paint();
};

const callWaiter = async () => {
  const mesa = state.mesa;
  try {
    if (!mesa.pedidoId && mesa.items.length) {
      const order = await api("/api/mesa", {
        codigo: state.member.codigo,
        sedeId: mesa.sedeId,
        mesa: mesa.numero,
        items: mesa.items,
      });
      mesa.pedidoId = order.pedidoId;
      save();
    }
    const call = await api("/api/mesero", {
      codigo: state.member.codigo,
      sedeId: mesa.sedeId,
      mesa: mesa.numero,
      pedidoId: mesa.pedidoId,
    });
    state.modal = { kind: "mesero", text: call.mensaje };
    paint();
  } catch {
    state.modal = {
      kind: "mesero",
      text: `Mesero en camino a la mesa ${mesa.numero}. No se envió SMS.`,
    };
    paint();
  }
};

const settle = async () => {
  const lines = state.mesa.items.filter((line) => !line.canje);
  const puntos = lines.reduce((sum, line) => sum + line.puntos * line.qty, 0);
  state.mesa.items = [];
  state.mesa.pedidoId = null;
  save();
  if (puntos > 0) {
    const synthetic = {
      id: "ticket",
      nombre: "Comanda de la mesa",
      puntos,
      precio: puntos * 100,
    };
    await buy(synthetic);
    return;
  }
  toast("Mesa en ceros. Nada nuevo que sumar.");
  paint();
};

const qrMarkup = (text) => {
  const factory = globalThis.qrcode;
  if (typeof factory !== "function") return `<strong>${text}</strong>`;
  const code = factory(0, "M");
  code.addData(text);
  code.make();
  return code.createSvgTag(4, 0);
};

const modalNode = () => {
  if (!state.modal) return null;
  if (state.modal === "compra") {
    const picks = [
      "cap-blend",
      "fil-paz-8",
      "croix",
      "tos-caprese",
      "matcha-latte",
      "brownie",
    ]
      .map(itemById)
      .filter(Boolean);
    return $("div", { class: "overlay", onclick: closeModal }, [
      $(
        "div",
        { class: "modal", onclick: (event) => event.stopPropagation() },
        [
          $("p", { class: "kicker", text: "Caja" }),
          $("h2", { text: "¿Qué se cobró?" }),
          $("p", {
            class: "meta",
            text: "Suma puntos y un sello. No cobra de verdad.",
          }),
          ...picks.map((item) =>
            $(
              "button",
              {
                class: "sede",
                type: "button",
                onclick: () => buy(item),
              },
              [
                $("b", { text: item.nombre }),
                $("span", {
                  class: "meta",
                  text: `${money(item.precio)} · +${item.puntos} pts`,
                }),
              ],
            ),
          ),
        ],
      ),
    ]);
  }
  if (state.modal === "premio") {
    return $("div", { class: "overlay" }, [
      $("div", { class: "modal" }, [
        $("div", { class: "seal", text: "8" }),
        $("h2", { text: "Tira completa" }),
        $("p", {
          class: "lede",
          text: "El octavo sello es un filtrado PAZ de 8 oz. Se reclama en caja y los sellos vuelven a cero.",
        }),
        $("button", {
          class: "solid",
          type: "button",
          text: "Listo",
          onclick: closeModal,
        }),
      ]),
    ]);
  }
  if (state.modal.kind === "canje") {
    const item = state.modal.item;
    return $("div", { class: "overlay" }, [
      $("div", { class: "modal" }, [
        $("div", { class: "seal", text: "Canje" }),
        $("p", { class: "count", text: String(state.member.puntos) }),
        $("h2", { text: item.nombre }),
        $("p", {
          class: "lede",
          text: "Quedó en $0 para la caja. Esta parte no vuelve a sumar puntos.",
        }),
        $("div", { class: "actions" }, [
          $("button", {
            class: "solid",
            type: "button",
            text: "Llevar a la mesa",
            onclick: () => {
              const chosen = item;
              state.modal = null;
              addToTable(chosen, true);
            },
          }),
          $("button", {
            class: "ghost ink",
            type: "button",
            text: "Seguir en la carta",
            onclick: closeModal,
          }),
        ]),
      ]),
    ]);
  }
  if (state.modal.kind === "mesero") {
    return $("div", { class: "overlay" }, [
      $("div", { class: "modal" }, [
        $("div", { class: "seal", text: "Mesa" }),
        $("h2", { text: "Va en camino" }),
        $("p", { class: "lede", text: state.modal.text }),
        $("button", {
          class: "solid",
          type: "button",
          text: "Seguir",
          onclick: closeModal,
        }),
      ]),
    ]);
  }
  return null;
};

const closeModal = (event) => {
  if (event?.target && event.target !== event.currentTarget) return;
  state.modal = null;
  paint();
};

const boot = async () => {
  load();
  const response = await fetch("/menu.json");
  state.carta = await response.json();
  if (location.hash) {
    const screen = location.hash.slice(1).split("?")[0];
    if (views[screen])
      state.screen =
        state.member || screen === "bienvenida" || screen === "alta"
          ? screen
          : "bienvenida";
  } else if (state.member) {
    history.replaceState({ screen: "casa" }, "", "#casa");
  }
  paint();
  setInterval(() => {
    if (state.llegada && state.llegada.expira > Date.now()) {
      const node = document.querySelector(".screen.active .clock");
      if (node) node.textContent = clock(sedeById(state.llegada.sedeId));
    }
  }, 1000);
};

window.addEventListener("popstate", () => {
  const screen = (location.hash || "#bienvenida").slice(1).split("?")[0];
  if (!views[screen]) return;
  if (!state.member && screen !== "bienvenida" && screen !== "alta") return;
  state.screen = screen;
  paint();
});

document.addEventListener("DOMContentLoaded", () => {
  boot().catch(() => {
    document.getElementById("app").textContent = "No cargó la carta del demo.";
  });
});
