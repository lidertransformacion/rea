# Propuesta: app de fidelización de Libertario

Diseño, sin construcción. Libertario Coffee Roasters, octubre de 2026.
El contexto de mercado está en [estudio-fidelizacion.md](estudio-fidelizacion.md).
La herramienta de análisis, y lo que no hace, está en
[analisis-rea.md](analisis-rea.md).

Esto no es asesoría legal, fiscal ni de protección de datos. Las reglas de
DIAN, SII y tratamiento de datos las tiene que cerrar el equipo jurídico y
contable antes de escribir el programa en producción.

## Para qué existe

Libertario ya vende en tienda con Odoo (POS, restaurante, inventario,
facturación, eCommerce) y ya tiene señal de lealtad en caja: la página
pública de la instancia lista, entre otras, Point of Sale, Restaurant y el
módulo «Fix EI Jorels with POS Loyalty Redemptions», descrito ahí como el
arreglo de la factura electrónica colombiana cuando hay redención de
loyalty. La lista completa de módulos no se auditó; la página puede estar
incompleta.

La app no es un segundo sistema de puntos. Es la cara del programa que ya
debe vivir en Odoo: el cliente ve saldo, nivel y premios; la caja sigue
siendo la que acumula, canjea y factura.

Mercados del brief: Colombia primero, Chile después. La historia pública de
la marca (Odoo, 2023) también nombra México, Costa Rica e India. Esos países
no entran en este corte. Un punto de un país no viaja a otro: la moneda, el
impuesto y la sociedad son distintos, y el punto no es dinero.

## Decisiones de producto

1. El saldo contable es el de Odoo (`loyalty.card` del contacto). La app
   solo lo muestra.
2. Acumular y canjear ocurre en el pedido del POS, antes de cerrar la
   factura. Así el arreglo Jorels sigue teniendo un ticket real que corregir.
3. El cliente se identifica con un código de su tarjeta de lealtad, no
   dictando la cédula. Menos dato en voz alta, menos error de digitación.
4. El nivel mira visitas. El punto mira pesos elegibles. Son cuentas
   distintas, como en el programa cafetero de referencia, con umbrales
   propios.
5. El canje no genera puntos. La propina tampoco. El impuesto no debería;
   hay que confirmarlo contra la base del POS (con o sin IVA).
6. No hay saldo prepago ni wallet en el MVP. Eso es dinero del cliente y
   otro control. Odoo sabe hacer gift card y eWallet; se dejan para una
   fase posterior, si finanzas los pide.
7. No hay red de marcas. Libertario no es Leal.

### Moneda de cara al cliente

Odoo otorga puntos por pedido, por unidad de moneda o por unidad de
producto. Un balance nativo no guarda lotes con vencimiento propio: guarda
un saldo y, si se configura, un vencimiento de la tarjeta.

Propuesta para no pelear con esa forma:

- Por dentro, 1 punto Odoo = 1 peso elegible (COP o CLP según la compañía).
- En la app, el cliente ve «puntos» = ese saldo dividido por 100, sin
  decimales. $18.500 elegibles se ven como 185 puntos.
- El catálogo de premios se carga en puntos de cara al cliente y se traduce
  a puntos Odoo al aplicar la recompensa.
- Vencimiento del MVP: el saldo vence a los 12 meses sin una compra
  elegible. No es FIFO por compra. El FIFO se parece al de Juan Valdez y
  exige un libro de lotes que Odoo no trae; queda en el roadmap solo si
  finanzas lo exige.

Hay que probar en la versión instalada que el modo «por moneda» acepta la
base elegible (productos de café y comida, no propina ni recarga) y que el
número no se parte en fracciones raras. Si la versión solo admite enteros
por unidad de moneda, el esquema de arriba encaja. Si no, se ajusta la
regla antes de mostrar nada al cliente.

### Niveles

Se evalúan el día 1 de cada mes, con las visitas de los tres meses
anteriores. Una visita es un pedido POS pagado, identificado, que no sea
solo canje. Umbrales iniciales, para discutir con operaciones, no para
copiar:

| Nivel  | Visitas en 3 meses | Qué cambia                                                                                         |
| ------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| Casa   | Al inscribirse     | Acumula y canjea. Cumpleaños si dejó la fecha                                                      |
| Barra  | 6 o más            | Un punto extra por cada 100 pesos en un día al mes, avisado en la app                              |
| Oficio | 18 o más           | Lo de Barra, más una invitación a cata o a un café de filtro cuando la tienda la arme. Cupo finito |

No hay multiplicador permanente del estilo 1,7×. En café de especialidad el
margen no aguanta una tasa que sube para siempre. El nivel se siente en
acceso y en un día mejor, no en una máquina de puntos.

Bajar de nivel no borra puntos. Solo cambia el beneficio del mes siguiente.
Eso hay que decirlo en el alta, en una pantalla, no en un PDF.

### Premios del MVP

Tres, todos como recompensa de Odoo (`loyalty.reward`), con tope de precio
para cuidar el margen:

| Premio                                             | Costo visible | Tope                                                                                      | Tipo Odoo                                  |
| -------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| Bebida de la casa, tamaño de la tienda             | 1.200 puntos  | El precio de esa bebida en la lista. Si elige algo más caro, paga la diferencia en el POS | Producto gratis o descuento hasta un monto |
| Pastelería del día                                 | 800 puntos    | El ítem de pastelería más barato disponible, o un SKU fijo                                | Producto gratis                            |
| 20 % en una bolsa de café en grano, una vez al mes | 2.000 puntos  | Un SKU de grano, no toda la tienda                                                        | Descuento sobre productos concretos        |

El 20 % de Tostao' y el tope en dólares de Starbucks son referencias de
problema (retorno y margen), no la tabla a copiar. Los costos de arriba son
un punto de partida para que finanzas calcule el retorno sobre una visita
media. Si la visita media en Colombia está lejos de $12.000 elegibles, 1.200
puntos ( $120.000 acumulados ) puede ser demasiado lento o demasiado fácil.
Se ajusta con un mes de tickets reales, no con la app en producción.

McDonald's publica que no deja completar un premio con plata. Aquí la
diferencia sí se paga, porque el menú de especialidad tiene precios
distintos por origen. La diferencia no acumula puntos.

## Funcionalidades

### MVP, Colombia

El cliente puede:

- Crear la cuenta con celular y un código de un solo uso. Nombre y correo.
  La fecha de nacimiento es opcional y solo sirve para el beneficio de
  cumpleaños.
- Ver saldo, puntos que faltan para el premio más cercano, nivel y la fecha
  en que el saldo vencería si no vuelve.
- Mostrar el código de la tarjeta para que la caja lo escanee antes de
  cobrar.
- Ver el historial de pedidos identificados: fecha, tienda, puntos ganados
  o usados. Sin el detalle fiscal completo.
- Elegir un premio y obtener un código de un solo uso, corto, que la caja
  aplica en el POS. Vence en minutos y muere al usarse.
- Pedir que borren la cuenta.

La caja, en Odoo, sigue haciendo:

- Asignar el contacto al leer el código.
- Mostrar los puntos que el pedido va a sumar.
- Aplicar la recompensa elegida y cerrar la orden.
- Emitir la factura electrónica con el flujo Jorels ya instalado.

La app no cobra en el MVP. Se paga en caja como hoy.

### Explícitamente fuera del MVP

- Pedido anticipado y recoger en tienda.
- Pago en la app, PSE, Nequi, Daviplata o tarjeta guardada.
- Saldo prepago, gift card y Leal Coins propios.
- Chile, y el resto de países.
- Notificación push de marketing.
- Niveles Barra y Oficio automatizados. En el MVP todos son Casa; el
  cálculo de visitas se deja listo en el modelo, apagado.
- Retos, juegos, referidos y puntos por abrir la app.
- Integración con Rappi u otro agregador. Esas ventas no identifican al
  miembro y no acumulan, igual que el FAQ de MiMcDonald's excluye otro
  e-commerce.

### Onboarding

Tres pantallas, en este orden:

1. Qué es un punto y qué no es (no es plata, no se transfiere, vence por
   inactividad).
2. Celular y código.
3. El código de caja, en grande, con la frase «muéstralo antes de pagar».

El documento de identidad no se pide en el alta. En Colombia mucha venta de
mostrador queda como consumidor final. Pedir la cédula el primer día copia
la fricción de Leal y de Tostao' y aumenta el dato personal sin hacer falta
para acumular. El documento entra solo cuando la persona pide factura a su
nombre. Esa decisión hay que ensayarla en un POS de prueba: si marcar al
miembro como cliente del pedido obliga a facturar a su nombre, el flujo de
caja cambia y hay que diseñarlo con quien opera Jorels, no con la app.

### Notificaciones

| Momento                    | Canal en el MVP                                                   | Por qué                                                              |
| -------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Código de acceso           | SMS o WhatsApp transaccional del proveedor que ya use la compañía | Sin eso no hay cuenta                                                |
| Puntos acreditados y canje | Correo, si dejó correo. Odoo ya tiene correo                      | El ticket manda; el correo es copia                                  |
| Cumpleaños y día Barra     | Correo, con casilla aparte de aceptación                          | Marketing, no hace falta para operar                                 |
| Push                       | No                                                                | Pide consentimiento, FCM o APNs y un motivo mejor que «abrir la app» |

El módulo público «Telegram Alerts» se ve como aviso interno. No es el canal
del cliente.

### Pagos

MVP: el pago no pasa por la app.

Cuando exista pedido en la app, el pago lo cobra un proveedor (no el
teléfono guardando el PAN) y el pedido nace en Odoo como una orden que el
POS o el eCommerce ya sepan facturar. Los puntos solo se combinan con ese
pago si el canje ya quedó como recompensa de la orden. Misma regla que la
propuesta de caja: una sola orden, un solo documento.

Chile, en esa fase, usa los medios que la sociedad chilena ya tenga en
Odoo. No se copia Nequi ni Daviplata.

## Arquitectura

```text
teléfono
  └─ app (cuenta, saldo, código, premio)
        └─ API de Libertario
              autentica al miembro
              no guarda la clave maestra de Odoo en el teléfono
              └─ Odoo, una compañía por país
                    res.partner
                    loyalty.program / rule / reward
                    loyalty.card          ← saldo
                    pos.order              ← gana y canjea
                    factura electrónica    ← Jorels en Colombia
```

La API es un controlador acotado dentro de Odoo o un servicio chico delante.
Habla con modelos concretos. No publica XML-RPC de administrador hacia el
teléfono. Cada llamada lleva el usuario del miembro, no un empleado de caja.

Contrato mínimo:

| Operación                              | Lee o escribe                                                     | Dueño del hecho                 |
| -------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| Pedir y confirmar el código de celular | Crea o encuentra `res.partner` y la `loyalty.card` de la compañía | API                             |
| Ver saldo, nivel y premios             | Lee tarjeta, programa y recompensas                               | Odoo                            |
| Ver historial                          | Lee pedidos POS ya pagados de ese contacto                        | Odoo                            |
| Código de caja                         | El código de `loyalty.card`, el que el POS ya sabe buscar         | Odoo                            |
| Intención de canje                     | Reserva de un solo uso, minutos de vida                           | API, y el POS la consume        |
| Aplicar premio y sumar puntos          | `pos.order` al cobrar                                             | POS. La app no escribe el saldo |

Si la API y el POS escriben el saldo a la vez, el arreglo de factura y el
saldo se desfasan. Por eso el teléfono no suma puntos.

### Caja

Reglas de operación, además del software:

- El código se escanea antes de cobrar. Si el pedido ya se pagó, no se
  carga después. Es la misma regla que publican los programas serios, y
  evita reabrir una factura electrónica.
- No dejar un cliente por defecto en las cajas que usen lealtad. La página
  pública lista una app «POS Default Customer». Si esa caja imputa cada
  ticket a un contacto genérico, los puntos se los queda el genérico.
- Probar una redención real contra el módulo Jorels ya instalado: bebida
  gratis, descuento parcial y diferencia pagada. Si el XML de la DIAN falla,
  el premio no sale a tienda.
- La analítica de POS, si sigue activa, no se rompe al aplicar la
  recompensa. Hay un módulo público de cuenta analítica en pedidos POS; se
  verifica en la misma orden de prueba.

### Chile

Misma app, otra compañía Odoo, otro programa de loyalty, pesos chilenos,
RUT cuando haga falta factura, localización chilena en lugar de Jorels. El
miembro puede tener dos tarjetas si viaja; no se suman. El MVP no incluye
esta compañía. El modelo sí la prevé para no rehacer la API.

### Datos

Se guarda lo necesario para operar el programa: celular, nombre, correo si
lo da, fecha de nacimiento si la da, tienda y el vínculo con el contacto de
Odoo. No se guarda el documento «por si acaso». No se usa el historial para
otra finalidad sin una base distinta. Colombia (Ley 1581 de 2012) y Chile
tienen reglas propias; el texto de la app sale de la política que apruebe
legal, no de este documento.

Borrar la cuenta archiva el contacto según lo que contabilidad deba
conservar de la factura, y apaga la tarjeta de lealtad. La factura no se
borra porque el cliente cierre la app.

### Qué haría REA aquí

Cuando exista un build propio de la app, REA sirve para mirar ese build:
grafo JavaScript, y una copia en reposo de la base local si la hubiera. No
hace falta para diseñar el contrato con Odoo. No se usa sobre las apps del
estudio de mercado. El entorno actual ya corrió ese tipo de inspección sobre
un ejemplo propio; ver [analisis-rea.md](analisis-rea.md).

## MVP y corte

Definición de hecho, en una tienda piloto de Colombia:

- Un cliente nuevo termina el alta y muestra un código.
- La caja lo identifica, cobra un pedido real y el saldo sube lo acordado.
- El mismo cliente canjea el premio de bebida, paga la diferencia si la hay,
  y esa orden no suma puntos por el tramo canjeado.
- La factura electrónica de las dos órdenes queda aceptada.
- Un pedido sin código no suma.
- Un segundo intento del código de canje no aplica.
- El saldo de la app y el de `loyalty.card` coinciden al refrescar.

Hasta que esas siete cosas pasen en el POS de prueba, no hay piloto en
tienda.

Orden de construcción, cuando se autorice:

1. Programa de loyalty de una compañía colombiana, tres premios apagados,
   una bebida encendida. Sin app.
2. Prueba de factura con Jorels en los tres casos de canje.
3. API de alta, saldo, código de tarjeta e historial.
4. App con las tres pantallas de alta y la pantalla de saldo.
5. Código de canje de un solo uso y botón de recompensa en el POS.
6. Piloto en una tienda, dos semanas, con alguien de caja en el diseño.
7. Recién ahí, cumpleaños y el correo promocional.

## Roadmap

| Corte                       | Entra                                                                                             | Sigue fuera                 |
| --------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| 0. Caja                     | Loyalty nativo, prueba DIAN, código de tarjeta, sin cliente por defecto                           | App                         |
| 1. MVP                      | Alta, saldo, historial, un premio, una tienda piloto                                              | Niveles, push, pagos, Chile |
| 2. Hábito                   | Niveles Casa / Barra / Oficio, cumpleaños, correo con permiso                                     | Push, wallet                |
| 3. Más tiendas Colombia     | El mismo programa en la red colombiana. El premio puede variar por tienda si el POS ya lo permite | Otra moneda                 |
| 4. Chile                    | Compañía, programa en CLP, prueba SII, la misma app                                               | Sumar puntos entre países   |
| 5. Pedido propio            | Recoger en tienda, pago con proveedor, canje dentro de esa orden                                  | Agregadores                 |
| 6. Solo si finanzas lo pide | Gift card de Odoo, separada del punto. FIFO de lotes si el vencimiento por inactividad no alcanza | Wallet disfrazado de puntos |

No hay fecha en este corte. El orden es el contrato: nada de la fila
siguiente sale si la fila anterior no facturó bien.

## Riesgos

| Riesgo                                                    | Qué se hace                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| La versión de Odoo no parte el punto como asume esta nota | Se confirma en un programa de prueba antes de la API                            |
| Jorels rechaza la nota de la recompensa                   | El premio no se enciende. No se parcha desde la app                             |
| El cliente por defecto se queda con los puntos            | Se apaga en las cajas del piloto y se revisa en el cierre del día               |
| El código corto se fotografía y se usa dos veces          | Un solo uso, vida de minutos, atado a la tarjeta                                |
| Pedir la cédula «porque todos la piden»                   | No está en el alta. Se reabre solo con un motivo fiscal                         |
| Copiar umbrales de otra marca                             | Los de esta nota son hipótesis. Se recalculan con tickets de Libertario         |
| Tratar el punto como pasivo financiero                    | El texto del programa dice que no es dinero ni es transferible. Legal lo revisa |

## Qué no se construyó

No hay app, módulo Odoo, ni cambio de caja en este trabajo. El único cambio
en el repositorio son estas notas y su exclusión del sitio público de REA.
