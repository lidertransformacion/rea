# Propuesta: app de fidelización de Libertario

Diseño, sin construcción. Libertario Coffee Roasters, octubre de 2026.
El contexto de mercado está en [estudio-fidelizacion.md](estudio-fidelizacion.md).
La llegada a tienda, los pases y el QR de mesa están en
[experiencia-tienda.md](experiencia-tienda.md). La herramienta de análisis,
y lo que no hace, está en [analisis-rea.md](analisis-rea.md).

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
3. En caja el cliente se identifica con el código de su tarjeta. El alta
   pide celular, correo, nombre y cédula, en un solo paso.
4. El nivel mira visitas. El punto mira pesos elegibles. Son cuentas
   distintas, como en el programa cafetero de referencia, con umbrales
   propios.
5. El canje no genera puntos. La propina tampoco. El impuesto no debería;
   hay que confirmarlo contra la base del POS (con o sin IVA).
6. No hay saldo prepago ni eWallet de Odoo en el MVP. Eso es dinero del
   cliente. La tarjeta de Apple Wallet y la de Google Wallet sí entran:
   muestran sellos y puntos, y no guardan plata.
7. No hay red de marcas. Libertario no es Leal.
8. Se paga en caja. El pedido de la mesa no cobra. No hay pago dentro de
   la app.
9. La promo de llegada es una notificación local disparada por la geocerca
   de la app, y abre el menú de esa sede. La ubicación del pase es un extra
   opcional.

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

### Premios del programa vigente

El demo usa el catálogo que ya está en la cuenta de la casa, no una tabla prestada:

| Premio                 | Puntos |
| ---------------------- | ------ |
| Americano Paz o Libre  | 700    |
| Cappuccino Paz o Libre | 910    |
| Croissant de almendras | 2.000  |

Cada $100 en caja suman un punto. El alta deja un bono de 1.000. Los tres se piden hasta el 31 de diciembre de 2026 y se cambian enteros: no se completan con plata. El canje no suma puntos. El historial se anota por sede, por ejemplo Libertario calle 93. Si un lote vence dentro del mes, la casa lo dice; una cuenta nueva no tiene ese lote.

La pantalla que los muestra es de Libertario. No repite la estructura ni el aspecto de las apps que se miraron para entender el uso.

La tabla anterior, con 1.200, 800 y 2.000, era una hipótesis de margen antes de leer este catálogo. Finanzas puede revisarlo. El demo no la usa.

## Funcionalidades

### MVP, Colombia

El cliente puede:

- Crear la cuenta con celular, correo, nombre y cédula, en un solo paso.
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
- Pago en la app o en la mesa, incluido PSE, Nequi, Daviplata o tarjeta guardada.
- Saldo prepago, gift card y Leal Coins propios.
- Chile, y el resto de países.
- Promo por la ubicación del Wallet. Puede sumarse después; no es el canal.
- Niveles Barra y Oficio automatizados. En el MVP todos son Casa; el
  cálculo de visitas se deja listo en el modelo, apagado.
- Retos, juegos, referidos y puntos por abrir la app.
- Integración con Rappi u otro agregador. Esas ventas no identifican al
  miembro y no acumulan, igual que el FAQ de MiMcDonald's excluye otro
  e-commerce.

### Onboarding

El alta es un solo paso: celular, correo, nombre y cédula. Santiago lo cerró
así. No hay carrusel antes del formulario.

En caja se muestra el código de la tarjeta, en grande, con la frase
«muéstralo antes de pagar». La prueba no envía SMS, WhatsApp ni correo: el
código se lee en la base de prueba, y en el demo local aparece en la tarjeta.
Pedir la cédula no decide a nombre de quién sale la factura. Si el POS obliga
a facturar al miembro, eso se ve con quien opera Jorels, en la base de
prueba.

### Notificaciones

| Momento                     | Canal en el MVP                                   | Por qué                                                 |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Código de acceso, en prueba | Lo muestra la base de prueba                      | No se envía SMS, WhatsApp ni correo                     |
| Puntos acreditados y canje  | Correo, si dejó correo. Odoo ya tiene correo      | El ticket manda; el correo es copia                     |
| Cumpleaños y día Barra      | Correo, con casilla aparte de aceptación          | Marketing, no hace falta para operar                    |
| Promo al llegar             | Notificación local de la geocerca, en el teléfono | Abre el menú de esa sede. No viaja la coordenada a Odoo |
| Ubicación del Wallet        | Extra opcional                                    | Asoma el pase. No reemplaza la promo ni abre el menú    |

El módulo público «Telegram Alerts» se ve como aviso interno. No es el canal
del cliente.

### Pagos

MVP: se paga en caja. El QR de la mesa arma el pedido y no cobra. La app
tampoco cobra. El canje de un producto entra en ese mismo ticket, antes de
cobrar, y ese tramo no suma puntos.

Un pago dentro de la app, si algún día existe, sería otra fase y otro
proveedor. No está en este corte. Chile, cuando llegue, también cobra en
su caja.

Chile, en esa fase, usa los medios que la sociedad chilena ya tenga en
Odoo. No se copia Nequi ni Daviplata.

## Arquitectura

```text
teléfono
  └─ app
        geocerca por sede → promo local y menú de esa sede
        pase Apple / Google → sellos y saldo, se actualiza al cobrar
        └─ API de Libertario
              solo la base de prueba
              rechaza libertariocoffee.odoo.com
              └─ Odoo de prueba
                    res.partner
                    loyalty.program / rule / reward
                    loyalty.card          ← saldo
                    pos.order              ← pedido de mesa y cobro en caja
                    factura de prueba
```

El dibujo completo, con el QR de mesa y las variables de entorno, está en
[experiencia-tienda.md](experiencia-tienda.md). La API no abre producción.

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

Definición de hecho, en la tienda piloto, contra la base de prueba:

- La API se niega a abrir el host de producción.
- Una geocerca de esa sede muestra la promo vigente y abre su menú. Una
  promo vencida no aparece. La ubicación del Wallet no hace falta para
  esta prueba.
- El QR de una mesa deja un pedido sin pago. «Llamar mesero» se ve en la
  caja. El cobro es en el mostrador.
- Esa compra suma puntos por el gasto elegible y llena un sello.
- El canje de un producto entra en el mismo ticket y no suma puntos sobre
  lo canjeado.
- El saldo de la app, el de `loyalty.card` y, cuando ya existan las
  cuentas, el del pase, coinciden después de cobrar.
- Un pedido sin código no suma. Un segundo uso del código de canje no
  aplica.
- No sale correo ni SMS.

Hasta que eso pase en el POS de prueba, no hay piloto con clientes.

Orden de construcción, cuando se autorice:

1. Base de prueba, loyalty, una promo con horario y una mesa. Sin tocar
   producción.
2. Guardia de host. Una llamada al host de producción tiene que fallar.
3. QR sin pago, aviso al mesero y cobro en caja.
4. Puntos y sellos sobre esa orden.
5. Geocerca y notificación local en un build propio.
6. Pases firmados, solo si el certificado y la cuenta de Google ya están
   fuera del repo. Si no están, esta casilla espera y el resto sigue.
7. Extra de ubicaciones del Wallet, al final y apagado por defecto.

## Roadmap

| Corte                       | Entra                                                                                             | Sigue fuera                     |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| 0. Caja de prueba           | Loyalty, promo con horario, mesa, cobro en caja, sin cliente por defecto                          | Producción, pago en el teléfono |
| 1. MVP                      | Geocerca con push local, QR sin pago, puntos, sellos y pases si ya hay cuentas                    | Ubicación del Wallet, Chile     |
| 2. Hábito                   | Niveles Casa / Barra / Oficio, cumpleaños, correo con permiso                                     | Pago en la app                  |
| 3. Más tiendas Colombia     | Una geocerca por sede. El premio puede variar por tienda si el POS ya lo permite                  | Otra moneda                     |
| 4. Chile                    | Compañía, programa en CLP, prueba SII, la misma app, cobro en caja                                | Sumar puntos entre países       |
| 5. Extra de Wallet          | Hasta diez sedes en el pase, como orientación                                                     | Usarlo como canal de promo      |
| 6. Solo si finanzas lo pide | Gift card de Odoo, separada del punto. FIFO de lotes si el vencimiento por inactividad no alcanza | eWallet disfrazado de puntos    |

No hay fecha en este corte. El orden es el contrato: nada de la fila
siguiente sale si la fila anterior no facturó bien.

## Riesgos

| Riesgo                                                    | Qué se hace                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| La versión de Odoo no parte el punto como asume esta nota | Se confirma en un programa de prueba antes de la API                            |
| Jorels rechaza la nota de la recompensa                   | El premio no se enciende. No se parcha desde la app                             |
| El cliente por defecto se queda con los puntos            | Se apaga en las cajas del piloto y se revisa en el cierre del día               |
| El código corto se fotografía y se usa dos veces          | Un solo uso, vida de minutos, atado a la tarjeta                                |
| La cédula del alta cambia el nombre de la factura         | El alta ya la pide. La factura se confirma con Jorels, en la base de prueba     |
| Copiar umbrales de otra marca                             | Los de esta nota son hipótesis. Se recalculan con tickets de Libertario         |
| Tratar el punto como pasivo financiero                    | El texto del programa dice que no es dinero ni es transferible. Legal lo revisa |

## Decisiones abiertas

Cerradas para el MVP, y ya reflejadas arriba: el pago es en caja, y la
promo es push nativo con geocerca en la app. La ubicación del Wallet queda
como extra opcional.

Siguen sin dueño:

1. **Cuenta de Apple Developer y emisor de Google Wallet.** Siguen
   pendientes. No hay deploy ni pase firmado. El demo dibuja la tarjeta en
   el teléfono y nada más. El certificado, la contraseña y la cuenta de
   servicio, cuando existan, van a variables de entorno o a una bóveda. No
   al repositorio.
2. **Tienda piloto y versión de Odoo.** La página pública no fija la
   versión. El QR de mesa y el botón de mesero se prueban en una base de
   prueba, nunca en `libertariocoffee.odoo.com`.

El alta ya no está abierta: pide celular, correo, nombre y cédula.

## Qué no se construyó

No hay módulo de Odoo, no hay pase firmado y no hubo llamada a producción.
No se envió correo ni mensaje. El demo local vive en
`demo/libertario-fidelizacion`: un proyecto Expo, web y nativo en el mismo
código. Cómo levantarlo está en el README de esa carpeta. Las notas siguen
fuera del sitio público de REA.
