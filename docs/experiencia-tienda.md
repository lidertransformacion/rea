# Experiencia en tienda

Cuatro piezas pedidas para la app de Libertario, leídas en fuentes públicas
y en artefactos propios. Octubre de 2026. Hay un demo local en
`demo/libertario-fidelizacion`. No se tocó Odoo de producción y no hay
deploy de Wallet. La interfaz del demo es de Libertario. Las otras marcas
solo se leyeron para ver el uso, no para copiar su forma.

El mapa de marcas está en [estudio-fidelizacion.md](estudio-fidelizacion.md).
El corte de producto, con estas decisiones ya aplicadas, está en
[propuesta-app-fidelizacion-libertario.md](propuesta-app-fidelizacion-libertario.md).
Lo que REA pudo y no pudo ver está en [analisis-rea.md](analisis-rea.md).

Esto no es asesoría legal ni fiscal.

## Decisiones ya tomadas

Santiago las cerró para el MVP:

1. **Se paga en caja.** No hay pago en la app ni en la mesa. El QR pide y
   llama al mesero. La plata se cobra en el mostrador, sobre el pedido de
   esa mesa.
2. **La promo usa push nativo con geocerca dentro de la app.** Al entrar a
   la sede, el teléfono muestra el aviso de una promo con hora de
   vencimiento y abre el menú de esa tienda. La ubicación del pase de
   Wallet es un extra opcional: puede asomar la tarjeta en la pantalla de
   bloqueo. No sustituye el aviso ni abre el menú.

Siguen abiertas, al final de la propuesta: la cuenta de Apple Developer, el
emisor de Google Wallet, la tienda piloto y la versión de Odoo. El alta ya
pide celular, correo, nombre y cédula, en un solo paso.

## Las cuatro piezas

| Pieza                             | Qué tiene que pasar                                                                                    | Dónde vive el hecho                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Geocerca, estilo llegada a tienda | Una geocerca por sede. Al entrar, push de una promo vigente y el menú de esa sede                      | La app, en el teléfono. El servidor no recibe un rastro de ubicación |
| Puntos, estilo Juan Valdez        | Se ganan por el gasto elegible y se canjean por productos                                              | `loyalty.card` y el `pos.order` cobrado en caja                      |
| Tarjeta en Wallet                 | Sellos que se llenan por compra y saldo de puntos visible. El pase se actualiza después de cada compra | Apple PassKit y Google Wallet. El saldo sigue siendo el de Odoo      |
| Mesa, estilo mini programa        | QR de la mesa, pedido desde la mesa, botón de llamar al mesero                                         | Menú QR del POS de **prueba**. El pago no                            |

## Qué dicen las fuentes públicas

Fecha de lectura: 14 de octubre de 2026. REA no se corrió sobre las apps de
estas marcas.

### Llegada y promo

El FAQ de MiMcDonald's Colombia leído para el estudio no describe geocercas.
Lo que está publicado es de Estados Unidos:

- La app pide ubicación para ver el restaurante cercano y las ofertas de
  cerca ([FAQ de ubicación](https://www.mcdonalds.com/us/en-us/faq/how-do-i-turn-location-services-on-off.html)).
- Mobile Order & Pay aparece cuando la persona está a menos de 5 millas de
  un local que lo ofrece, y el menú es el de la sede elegida
  ([Mobile Order & Pay](https://www.mcdonalds.com/us/en-us/mobile-order-and-pay.html)).
- Ready on Arrival usa la geocerca para avisar a la cocina de que el
  cliente se acerca. El blog técnico de McDonald's lo cuenta como perímetros
  alrededor del local, con aviso, promo y preparación
  ([Inside the geofence](https://medium.com/mcdonalds-technical-blog/inside-the-geofence-faster-pickups-start-here-8b7ec97717fe)).
  Restaurant Dive recoge el despliegue anunciado a inversionistas en 2023
  ([nota](https://www.restaurantdive.com/news/McDonalds-doubles-down-geofencing-loyalty-growth/701753/)).

Eso es referencia de problema, no el comportamiento de Colombia y no un
permiso para mirar el binario. Para Libertario la geocerca abre el menú y
muestra una promo corta. No dispara la cocina: el pedido todavía no existe
cuando la persona cruza la puerta.

Leal, Tostao', Crepes & Waffles y los términos de Juan Valdez leídos no
describen una geocerca. Queda desconocido, no negado.

### Puntos por gasto, canje por producto

Juan Valdez publica 1 punto por cada $100 COP pagados y canje por productos
del catálogo o, en la app, como medio de pago. El detalle y la cita están en
el estudio. Libertario se queda con la mitad útil: puntos por gasto elegible
y canje por producto en el ticket de caja. No copia la tasa, los segmentos
ni el pago con puntos dentro de la app.

Leal acumula por marca y canjea premios de esa marca; la tasa no está en las
páginas leídas. MiMcDonald's canjea productos y, en el FAQ de Colombia, no
deja completar el premio con plata. Tostao' devuelve un cupón por el gasto
del mes, no una moneda de puntos. Crepes & Waffles, en su FAQ, habla de
bonos. Starbucks Rewards de Estados Unidos canjea por ítem con tope de
precio; Colombia sigue desconocido.

### Wallet

No apareció, en las páginas leídas, una ficha de Apple Wallet o Google
Wallet de Leal, Juan Valdez, MiMcDonald's Colombia, Tostao' o Crepes &
Waffles. No se afirma que no existan.

El contrato público de los pases sí está publicado:

- Un pase de Apple admite hasta 10 `locations`. Cada una puede llevar
  `relevantText`, el texto de la pantalla de bloqueo. `maxDistance` solo
  puede acortar el radio que Apple ya usa
  ([guía de ubicaciones](https://help.passkit.com/en/articles/2010114-how-many-locations-will-trigger-a-lock-screen-message),
  [diseño del pase](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html)).
  Una tarjeta de tienda (`storeCard`) muestra el saldo en campos y una
  `strip.png` detrás del campo principal. Eso alcanza para los sellos.
- Actualizar el pase pide `webServiceURL` y `authenticationToken`. El
  servidor manda un push vacío a Apple; el teléfono pide el pase nuevo.
  No se puede cambiar el serial ni el token
  ([actualizar un pase](https://developer.apple.com/documentation/WalletPasses/adding-a-web-service-to-update-passes)).
- Google Wallet: `loyaltyObject.loyaltyPoints.balance` es el saldo.
  `merchantLocations` admite 10 puntos por objeto y 10 por clase. El aviso
  cercano lo redacta Google y abre el pase, no el menú de Libertario.
  `locations` está deprecado para ese aviso. Un `PATCH` con
  `notifyPreference: NOTIFY` pide el aviso de actualización
  ([loyaltyobject](https://developers.google.com/wallet/reference/rest/v1/loyaltyobject),
  [avisos](https://developers.google.com/wallet/retail/loyalty-cards/use-cases/trigger-push-notifications)).

El pase no puede ser la geocerca del MVP: diez puntos no cubren una red, el
texto lo pone la plataforma y no abre el menú. Por eso queda como extra.

### Pedido en mesa

No es Meituan como app de domicilios. Las guías públicas de comer en China
describen otro gesto: un QR en la mesa, 扫码点餐, abierto con el escáner de
WeChat o Alipay. Eso levanta un mini programa del local, con categorías,
carrito y, en muchos casos, pago antes de que salga la comida. A veces se
paga al final
([cómo pedir](https://china-travel-checklist.com/how-to-order-food-in-china-restaurants/),
[QR en la mesa](https://china-panorama.com/en/how-to-order-food-china/)).
Meituan, en una guía en inglés, aparece como domicilios, cupones y
actividades ([Trip.com](https://www.trip.com/guide/info/meituan-app.html)),
no como el QR de la mesa. Un texto de plantillas de mini programas describe
un botón de llamar al mesero que avisa al personal
([Shulou](https://www.shulou.com/a112348)); es descripción de un patrón, no
un manual oficial de Meituan.

Odoo 18 publica lo más cercano que ya existe en el POS:
[self-order](https://www.odoo.com/documentation/18.0/applications/sales/point_of_sale/self_order.html).
«QR menu» muestra el catálogo. «QR menu + Ordering» deja pedir y también
pagar. En restaurante hay un QR por mesa, y el pedido cae a la pantalla de
preparación si hay sesión abierta. Esa página no describe un botón de
llamar al mesero. El pago en el teléfono se apaga para el MVP: la orden
queda abierta y se cobra en caja.

## Comparación corta

|                                 | Geocerca y menú al llegar                                                   | Puntos por gasto, canje por producto                  | Pase Wallet                                                           | QR de mesa y mesero                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Leal                            | No publicado                                                                | Puntos por marca; tasa no publicada                   | No publicado                                                          | No publicado                                                                                                   |
| MiMcDonald's CO                 | No está en el FAQ leído. En EE. UU. sí hay ubicación y geocerca de recogida | Canje de productos. Tasa de Colombia solo en prensa   | No publicado en lo leído                                              | Pedido en la app, no un QR de mesa                                                                             |
| Juan Valdez                     | No publicado                                                                | Publicado: $100 = 1 punto; catálogo y pago con puntos | No publicado                                                          | Pedido «recoger en tienda», no mesa                                                                            |
| Starbucks EE. UU.               | La app elige tienda; la geocerca de Colombia es desconocida                 | Stars por dólar, canje con tope                       | No se leyó la ficha del pase                                          | Pedido en la app                                                                                               |
| Tostao'                         | No publicado                                                                | Gasto del mes y cupón, no puntos                      | No publicado                                                          | No publicado. Club en portal                                                                                   |
| Crepes & Waffles                | No publicado                                                                | FAQ: bonos, no puntos                                 | No publicado                                                          | Domicilio propio. QR de mesa desconocido                                                                       |
| Mesa en China (WeChat / Alipay) | No es el patrón leído                                                       | No es el patrón leído                                 | No es el patrón leído                                                 | QR, menú, pedido. El pago en el teléfono es frecuente. Llamar al mesero aparece en descripciones de plantillas |
| Libertario, MVP                 | Push local al entrar y menú de esa sede                                     | Puntos por peso elegible, premio en el ticket de caja | Sellos + saldo, se actualizan al cobrar. Ubicación del pase, opcional | QR, pedido sin pago, botón al mesero                                                                           |

## Qué inspeccionó REA

Dos artefactos propios, en `/tmp`. No son pases firmados ni una app de otra
marca.

### Paquete `.pkpass`

ZIP de muestra, 1630 bytes, SHA-256
`5d5e10a7db412987bb59dae9a18201eee1c48814c189b59e63d50b2fad5cc1fa`.
Sin firma. El token de ejemplo es el texto `sample-not-a-secret`.

```bash
node scripts/rea.mjs inspect-artifact \
  /tmp/rea-demo/wallet/libertario-sample.pkpass --json
```

Evidence `ev_387ec1818d0ba18e51d5cfe95c80afb977240348a7a925de8b2289a38bd16f4d`,
`confidence: observed`, proveedor `rea-artifact-graph`. El inventario
interno es `ev_2884d41d5e42156b1229d7a791ba8dc60b57c543395f003345e256f7ef228764`.
Cobertura `complete-within-substeps`. Seis nodos: el ZIP y
`pass.json`, `manifest.json`, `icon.png`, `logo.png`, `strip.png`.
No hay `signature`. Cero contradicciones de integridad.

La limitación del resultado: la inspección no ejecuta el archivo ni afirma
la semántica del formato. REA vio los miembros. No leyó «185 puntos» ni
«3 de 8». Esos textos están en el `pass.json` que escribimos nosotros. Un
iPhone rechazaría este ZIP por falta de firma. Sirve para fijar el sobre,
no para repartir tarjetas.

### Llegada a la sede

Directorio propio `arrival`: `onStoreEnter` solo sigue si `kind` es
`enter`, y entonces llama a `openStoreMenu`.

Evidence `ev_379041ebd06fa8c5f5715286ab196e9870ed5440c08cbf9d3486c34dabd96e5d`,
`confidence: derived`. Dos JavaScript parseados, 74 nodos AST, cero fallos.
El import `./menu.js` resolvió a `src/menu.js` con estado `inferred`: la
sintaxis no prueba que alguien haya entrado a una tienda.

## Arquitectura

```text
teléfono de la app
  geocerca local, una por sede
  al entrar: notificación local de la promo vigente
             y ruta /menu/{sede}
  pase de Wallet, opcional, no abre esa ruta

QR de mesa  →  menú de esa sede en el POS de prueba
               pedido sin cobro
               «llamar mesero» → aviso en la sesión de caja abierta
caja        →  cobra
               suma puntos y un sello
               actualiza Apple y Google

Odoo de prueba, y solo ese
  loyalty.card = saldo
  pos.order    = pedido y cobro
  factura de prueba
```

La API habla con la base de prueba. Rechaza el host de producción
`libertariocoffee.odoo.com` y cualquier host que no esté en una lista
permitida. La lista, la URL, la base, el usuario y la clave van en
variables de entorno o en una bóveda. No entran al repositorio.

Nombres previstos, sin valores:

| Variable                             | Uso                                           |
| ------------------------------------ | --------------------------------------------- |
| `ODOO_TEST_URL`                      | Host de la base de prueba                     |
| `ODOO_TEST_DB`                       | Nombre de esa base                            |
| `ODOO_TEST_LOGIN`                    | Usuario de la API de prueba                   |
| `ODOO_TEST_API_KEY`                  | Clave de ese usuario                          |
| `ODOO_TEST_HOST_ALLOWLIST`           | Hosts que la API acepta                       |
| `APPLE_PASS_TYPE_IDENTIFIER`         | Tipo de pase                                  |
| `APPLE_TEAM_ID`                      | Equipo de Apple                               |
| `APPLE_PASS_CERT_PATH`               | Certificado fuera del repo                    |
| `APPLE_WWDR_CERT_PATH`               | Certificado WWDR fuera del repo               |
| `APPLE_PASS_CERT_PASSWORD`           | Secreto del certificado                       |
| `GOOGLE_WALLET_ISSUER_ID`            | Emisor                                        |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_PATH` | JSON de la cuenta de servicio, fuera del repo |

El certificado, la contraseña y el JSON de Google no se imprimen en logs.
Esta nota no envía correos ni mensajes a nadie. El aviso de promo es local,
en el teléfono que tiene la app. El aviso al mesero se queda en la sesión
de caja de prueba. No hay SMS ni correo a clientes en este corte.

### Geocerca

Hay una región por sede, con el radio que operaciones mida en la puerta.
La app baja la lista de sedes y las promos, cada promo con inicio y fin.
Al entrar, si hay una promo vigente para esa sede, muestra una notificación
local con la hora de corte y abre el menú. Si la promo ya venció, abre el
menú sin ella. Salir de la sede no manda otro aviso.

El teléfono no reporta la coordenada a Odoo. Hace falta permiso de
ubicación y de notificaciones, dicho en el alta de esos permisos. Sin
permiso, el menú se elige a mano.

El extra de Wallet, si algún día se enciende, copia como mucho diez sedes
favoritas a `locations` o a `merchantLocations`. El texto es de orientación,
no la promo. Diez es el tope publicado por Apple y por Google.

### Puntos y sellos

- 1 punto interno de Odoo = 1 peso elegible. En la tarjeta se ve ese saldo
  dividido por 100.
- El canje es un producto en el ticket, aplicado en caja antes de cobrar.
  Ese tramo no vuelve a sumar puntos.
- Ocho sellos. Una compra identificada y cobrada llena uno. Al octavo, la
  caja ofrece el premio de la tarjeta y la tira vuelve a cero. El premio de
  sellos no es el mismo que el catálogo de puntos.
- `headerFields` en Apple y `loyaltyPoints.balance` en Google muestran los
  puntos. La `strip.png`, o la imagen equivalente de Google, muestra los
  sellos llenos. Es una imagen nuestra, regenerada al cobrar. REA no
  interpreta esos píxeles.

### Mesa

En la base de prueba, con la versión que tenga `pos_self_order`:

- Un QR por mesa. Abre el menú de esa sede.
- El pedido queda en la mesa, sin método de pago en el teléfono.
- «Llamar mesero» publica un aviso en la sesión de caja abierta. Si el
  módulo estándar no tiene ese botón, se agrega uno propio en la base de
  prueba. No se instala un módulo de terceros solo para esto.
- En caja, el mesero abre esa mesa y cobra. Ahí corren puntos, sellos,
  factura de prueba y la actualización de los pases.

Si la versión de prueba solo sabe pedir cobrando en el teléfono, esa opción
se deja apagada. No se enciende «para ver».

### Actualización del pase

Después de cobrar en la base de prueba:

1. Leer el saldo y los sellos de esa tarjeta.
2. Volver a dibujar la tira.
3. Firmar el `.pkpass` con el certificado que está fuera del repo y avisar
   a Apple con el push vacío del protocolo de pases.
4. Hacer `PATCH` del `loyaltyObject` de Google. `notifyPreference: NOTIFY`
   solo si se quiere el aviso de saldo, no como canal de la promo.

Sin cuenta de Apple o sin emisor de Google, el paso se queda en el JSON de
muestra. No se inventa un certificado.

## MVP

En una tienda piloto, contra la base de prueba:

- La API se niega a abrir el host de producción.
- Una geocerca de esa sede, en un teléfono de prueba, muestra la promo
  vigente y abre su menú. Una promo vencida no se muestra.
- El QR de una mesa arma un pedido sin pago. «Llamar mesero» se ve en la
  caja. El cobro ocurre en el mostrador.
- Esa compra suma puntos por el gasto elegible y llena un sello.
- El canje de un producto se aplica en el mismo ticket y no suma puntos
  sobre lo canjeado.
- Si ya hay cuenta de Apple y emisor de Google, el pase del teléfono de
  prueba muestra el saldo y los sellos nuevos. Si no hay cuenta, el corte
  de pase queda bloqueado en esa casilla y el resto del MVP igual puede
  pasar.
- La ubicación del Wallet no es necesaria para dar por buena la promo.
- No sale ningún correo ni SMS.

Orden, cuando se autorice construir:

1. Base de prueba, programa de loyalty, una promo con horario, una mesa.
2. Guardia de host. Una llamada al host de producción tiene que fallar.
3. QR de menú sin pago, pedido a la mesa, botón de mesero, cobro en caja.
4. Puntos y sellos sobre esa orden cobrada.
5. Geocerca y notificación local en un build propio.
6. Firma y actualización de pases, solo con secretos ya guardados fuera
   del repo.
7. Recién ahí, el extra de ubicaciones del Wallet.

## Qué no se hizo

No hay app publicada, no hay certificado, no hay llamada a Odoo y no se
envió ningún mensaje. El ZIP de muestra se quedó en `/tmp`.
