# Estudio de fidelización con REA

Plan para un estudio funcional y de experiencia, legal y ético, de programas
públicos de lealtad. Libertario Coffee Roasters, octubre de 2026.

Este documento no descompila apps, no reproduce código propietario y no
describe cómo evadir protecciones. El mapa de abajo sale de páginas, términos
y fichas públicas. Cada fila dice de qué fuente sale y qué queda sin saber.

REA entra como método de evidencia cuando el artefacto sea propio o esté
autorizado. El análisis de la herramienta está en
[analisis-rea.md](analisis-rea.md). La llegada a tienda, los pases y el QR
de mesa están en [experiencia-tienda.md](experiencia-tienda.md). La
propuesta de producto está en
[propuesta-app-fidelizacion-libertario.md](propuesta-app-fidelizacion-libertario.md).

## Alcance

Preguntas que el estudio quiere responder:

1. Qué ve y hace un cliente en onboarding, compra, acumulación y canje.
2. Cómo se ganan y se vencen los puntos o el sustituto (cupón, estrella, coin).
3. Si hay niveles y qué los mueve: gasto, visitas o los dos.
4. Dónde se identifica el cliente frente al POS: cédula, QR, código corto.
5. Qué pagos conviven con la lealtad y cuáles quedan fuera.
6. Cómo llegan las notificaciones y qué integración de caja hace falta.
7. Qué de eso cabe en Odoo POS sin un libro de puntos paralelo.

Fuera de alcance:

- APK, IPA o paquetes de terceros, aunque estén en una tienda pública.
- Tráfico interceptado, certificados instalados, Frida, depuradores o ADB
  sobre la app de otra marca.
- Cuentas que no sean del investigador, datos de otros clientes y bases
  SQLite copiadas del teléfono.
- Reproducir pantallas, textos largos, marcas o mecánicas como si fueran
  activos de Libertario.
- Afirmar que un término público sigue vigente en caja si no se contrastó.

El [disclaimer de REA](../DISCLAIMER.md) cierra el mismo perímetro: no
circunnavegar protecciones, no copiar software propietario, no saltarse
controles de acceso. Poseer un instalador no autoriza cada operación.

## Cómo usar REA sin salir de ese perímetro

Orden de evidencia, de la más débil a la que ya se puede defender:

| Capa                               | Qué responde                                   | Herramienta                                                                           | Condición                                                                                             |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1. Fuentes públicas                | Reglas que la marca publicó                    | Lectura humana. Sin REA                                                               | Citar URL y fecha. No tratar el marketing como el contrato                                            |
| 2. Sesión propia como cliente      | Flujo real de onboarding y canje               | Diario de UX. Capturas de la propia pantalla                                          | Cuenta propia, mayoría de edad, aceptar los términos. No compartir datos de otros                     |
| 3. Web pública sin login           | Estructura de una página de marca              | `inspect-web-page` o un escenario con acciones declaradas                             | Solo si el uso automatizado cabe en los términos del sitio. Si el sitio lo prohíbe, se observa a mano |
| 4. App o exportación de Libertario | Grafo, módulos, contrato con Odoo              | `analyze-javascript-application`, `inspect-sqlite-database` sobre una copia en reposo | Artefacto propio                                                                                      |
| 5. Motor nativo o APK propio       | Pseudocódigo o clases, si algún día hace falta | Ghidra o JADX, bring-your-own                                                         | Sigue sin autorizar el binario de un competidor                                                       |

En la corrida del 14 de octubre de 2026, las capas 4 y el ejemplo de control
funcionaron. La capa 5 no: no hay Ghidra, Hopper, IDA ni JADX en el entorno.
Ver [analisis-rea.md](analisis-rea.md).

Protocolo de una sesión propia, cuando se haga:

1. Una pregunta por visita (por ejemplo: «¿el canje ocurre antes o después del pago?»).
2. Cuenta del investigador, tienda real, compra pequeña si hace falta.
3. Anotar lo visto, la hora y la tienda. Guardar solo capturas propias.
4. Marcar observación, inferencia o desconocido. Una fila de marketing no
   confirma el POS.
5. No grabar el PIN, el token ni el cuerpo de un pago.
6. Parar si la app pide burlar un control para continuar.

REA no se corre contra esas apps en este plan. Si más adelante hubiera un
permiso escrito de un aliado para mirar su propio paquete, se abre otro
expediente y se vuelve a aplicar el disclaimer.

## Mapa de funcionalidades

Leyenda de evidencia:

- **Publicado:** página, términos o ficha de tienda citados.
- **Prensa:** nota periodística; puede estar desactualizada.
- **Desconocido:** no apareció en las fuentes leídas. No es una negación.

Fecha de lectura: 14 de octubre de 2026.

### Leal (red multimarca, Colombia)

Fuentes: [leal.co/usuarios-app-leal](https://www.leal.co/usuarios-app-leal),
centro de ayuda
([qué es Leal](https://centrodeayuda.leal.co/que-es-leal-para-usuarios),
[cómo redimir](https://centrodeayuda.leal.co/c%C3%B3mo-redimo-mis-puntos),
[código de canje](https://centrodeayuda.leal.co/c%C3%B3mo-generar-el-c%C3%B3digo-para-redimir-mis-premios))
y la ficha pública de Google Play (`com.kubo.leal`).

| Pieza                     | Qué se publicó                                                                                            | Evidencia                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Rol                       | Red de marcas. Los puntos de un comercio se canjean en ese comercio                                       | Publicado                                                                  |
| Onboarding                | Descargar la app y registrarse con los datos                                                              | Publicado, ficha de tienda                                                 |
| Identificación en caja    | Compartir el número de identificación con el cajero                                                       | Publicado                                                                  |
| Acumulación               | Al pagar en un comercio de la red. La tasa por peso no está en estas páginas                              | Publicado el hecho; la tasa es desconocida                                 |
| Premios                   | Cada marca define su lista y el costo en puntos                                                           | Publicado                                                                  |
| Canje                     | En tienda. Código de 4 dígitos en el inicio de la app, o SMS que envía el cajero. Datos personales al día | Publicado                                                                  |
| Leal Coins                | Cashback usable como pago en aliados o para bonos. Colombia y El Salvador                                 | Publicado                                                                  |
| Bonos de siguiente compra | El cajero emite un bono; la app muestra el vencimiento                                                    | Publicado                                                                  |
| Historial                 | Sección «Mis movimientos»                                                                                 | Publicado                                                                  |
| Descubrimiento            | Mapa de marcas                                                                                            | Publicado                                                                  |
| Pagos                     | Leal Coins se describen como efectivo digital de la red. No es la pasarela de la tienda                   | Publicado                                                                  |
| POS                       | Lo opera el cajero del comercio. No hay un POS único publicado                                            | Inferencia a partir del flujo de caja. El protocolo técnico es desconocido |
| Niveles                   | No descritos en estas páginas                                                                             | Desconocido                                                                |
| Notificaciones            | La ficha menciona enterarse de promociones. El canal exacto no está en el texto leído                     | Parcial                                                                    |

Lectura para Libertario: Leal resuelve la red, no la marca. El cliente
aprende un hábito (dar la cédula) que sirve en muchos mostradores y el premio
sigue preso de cada marca. Una tostadora con tiendas propias no necesita esa
red para el MVP. Sí necesita un identificador que el cajero pueda usar sin
dictar la cédula en voz alta.

### McDonald's Colombia (MiMcDonald's)

Fuente oficial leída:
[cloud.news.mcdonalds.com.co/MiM_CO](https://cloud.news.mcdonalds.com.co/MiM_CO).
La tasa «1 punto por cada $100» sale de prensa de lanzamiento
([La República](https://www.larepublica.co/empresas/mcdonald-s-lanza-el-programa-mimcdonald-s-para-premiar-la-lealtad-de-sus-clientes-4064916),
[Portafolio](https://www.portafolio.co/negocios/empresas/mimcdonald-s-ofertas-y-recompensas-del-nuevo-plan-de-fidelizacion-de-la-marca-624075)),
no del FAQ oficial recuperado. La ficha de Play
(`com.mcdo.mcdonalds`) describe la app regional, no la tabla de puntos de Colombia.

| Pieza               | Qué se sostiene                                                                            | Evidencia                           |
| ------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| Alta                | App de McDonald's, registro en la pestaña MiMcDonald's y un pedido                         | Publicado, FAQ                      |
| Dónde se acumula    | Mostrador, AutoMac, postres, McCafé, tótems, Pide y Pasa y domicilio de la app             | Publicado, FAQ                      |
| Identificación      | QR en mostrador y tótem; cédula en AutoMac; en el tótem también se puede digitar la cédula | Publicado, FAQ                      |
| Acreditación        | Entre 15 minutos y 72 horas, con tope de 31 días                                           | Publicado, FAQ                      |
| Exclusión           | Compras en e-commerce que no sea la app                                                    | Publicado, FAQ                      |
| Vencimiento         | 6 meses desde la compra                                                                    | Publicado, FAQ                      |
| Canje               | Solo dentro de la app, en Pide y Pasa o domicilio. No en el mostrador ni en un tercero     | Publicado, FAQ                      |
| Diferencia en plata | No se puede completar una recompensa pagando la diferencia                                 | Publicado, FAQ                      |
| Tasa                | 1 punto por cada $100 en el relato de lanzamiento                                          | Prensa. Vigencia actual desconocida |
| Niveles             | No aparecen en el FAQ leído                                                                | Desconocido                         |
| Cobertura           | Restaurantes de Colombia, según el FAQ                                                     | Publicado                           |
| Soporte             | contactos@mcdonalds.com.co                                                                 | Publicado                           |

El FAQ de MyMcDonald's de Estados Unidos describe otro programa (código de 4
dígitos también en restaurante). No se usa como regla de Colombia.

Lectura: el canje vive en el pedido digital, así el descuento queda en el
mismo ticket que la cocina y el pago. En Odoo eso equivale a aplicar la
recompensa en el `pos.order` antes de facturar, no en un cuaderno aparte.

### Juan Valdez (Amigos Juan Valdez)

Fuentes: términos publicados
([Amigos Juan Valdez](https://juanvaldez.com/amigosjuanvaldez/terminos-y-condiciones-programa-de-fidelizacion-juan-valdez/)),
la home del programa y la ficha de App Store de Juan Valdez Colombia. Los
términos se leyeron como texto; si PROCAFECOL los cambia, manda la versión
del sitio.

| Pieza                              | Regla publicada                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Quién                              | Personas naturales mayores de edad. No personas jurídicas                                                                                                                                        |
| Naturaleza                         | Punto promocional. No es dinero, título ni depósito                                                                                                                                              |
| Tasa                               | 1 punto por cada $100 COP pagados en tiendas adscritas, participantes, app, tienda online o quiosco                                                                                              |
| Visita                             | 1 compra = 1 visita. El canje de puntos y la recarga de saldo prepago no cuentan como visita                                                                                                     |
| Segmentos, evaluación semestral    | Amigo: 1 a 3 visitas al mes y/o 1 a 11.999 puntos. Buen Amigo: 4 a 13 visitas y/o 12.000 a 32.999 puntos. Mejor Amigo: 14 o más visitas al mes y/o más de 33.000 puntos. Cortes en enero y julio |
| Beneficio que sube con el segmento | Cumpleaños y promociones en todos. Puntos extra y pruebas de producto desde Buen Amigo. Eventos en Mejor Amigo                                                                                   |
| Vigencia del punto                 | 1 año, salvo una promo distinta. Al canjear sale primero el que vence antes                                                                                                                      |
| Canje en tienda                    | Catálogo a puntos fijos, total, no parcial. En caja se escanea el código de barras del reverso de la cédula colombiana                                                                           |
| Quiosco                            | Solo acumula, no canjea                                                                                                                                                                          |
| App                                | Puntos como medio de pago parcial o total, mínimo 500 puntos. En esa transacción no se acumula. La equivalencia de la app no es la del catálogo de tienda                                        |
| Factura                            | Si la factura electrónica no queda a nombre del miembro, esa compra no acumula                                                                                                                   |
| Pagos en app                       | Tarjeta, puntos, saldo prepago, PSE, Nequi y Daviplata. Solo los puntos se combinan con otro medio                                                                                               |
| Saldo prepago                      | Recarga con PSE. No se retira. La recarga de PROCAFECOL por promo sí puede vencer; la del usuario, no, según el texto leído                                                                      |
| Pedido                             | Recoger en tienda, desde la ficha de la app                                                                                                                                                      |

Lectura: es el referente cafetero más cercano. Separa estado (visitas) de
moneda de canje (puntos), y ata la acumulación a la factura electrónica. Eso
encaja con DIAN y con el módulo público de Libertario que corrige la factura
electrónica cuando hay redención en POS. El saldo prepago ya es otro producto
(dinero almacenado), no el MVP.

### Tostao' (Club del Antojao')

Fuente: PDF de términos en el sitio de la marca,
[Club del Antojao'](https://nosotros.tostao.com/wp-content/uploads/2025/03/Terminos-y-Condiciones-Club-Antojado-VF31012025.pdf),
vigencia declarada desde el 1 de mayo de 2024 hasta que el club termine.
No se encontró en esta lectura una app de lealtad de Tostao' Café y Pan. Una
ficha de Play llamada «Tostao's Tapas-bar» es de Owner.com y no se trata como
el club colombiano.

| Pieza                     | Regla en el PDF                                                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alta                      | Portal web, cédula, celular, mayor de 18 años. Cupón de bienvenida del 20 % por una compra, 30 días                                                                                                  |
| Identificación            | Decir la cédula en caja antes de pagar. No se carga después                                                                                                                                          |
| Qué se acumula            | El monto del mes, no una moneda de puntos. Se borra al cerrar el mes                                                                                                                                 |
| Acreditación              | Hasta 48 horas                                                                                                                                                                                       |
| Niveles por gasto del mes | Selecto: más de $80.000. El texto extraído dice Gourmet «más de $120.0000» y Supremo «más de $250.0000». Esa grafía es anómala; no la corrijo. Hay que volver a leer el PDF antes de usar las cifras |
| Premio                    | Cupón del mes siguiente, entre $8.000 y $40.000 según el texto, retorno declarado del 10 % al 16 % sobre el mínimo. Vence el primer día del mes siguiente                                            |
| Cumpleaños                | 20 % en una compra, 30 días                                                                                                                                                                          |
| Canje                     | Una sola compra, en tienda física, mostrando el código. Esa compra no vuelve a acumular                                                                                                              |
| Efectivo                  | No                                                                                                                                                                                                   |
| Datos y ética             | Política de tratamiento propia y declaración SAGRILAFT al registrarse                                                                                                                                |

Lectura: es lealtad de hábito mensual, simple para un formato de alto
tráfico. El costo es que el cliente que no llega al mínimo pierde el mes
entero. Para café de especialidad, un punto que no se borra el día 1 retiene
mejor a quien visita menos veces y gasta más por visita.

### Crepes & Waffles

Fuente oficial leída:
[preguntas frecuentes](https://www.crepesywaffles.com/preguntas-frecuentes).
Ahí el instrumento es el bono de regalo (plástico o virtual; valores
publicados de $30.000, $50.000 y $100.000 en la web, y desde $20.000 en
tienda), usable parcial o total. El domicilio propio cobra con link de
tarjeta, contraentrega, bonos de la marca y otros bonos (Sodexo, BigPass,
Quantum, Colsubsidio). No hay programa de puntos en ese FAQ.

Puntos Colombia y otros catálogos venden bonos de la marca. Eso es lealtad de
un tercero, no de Crepes & Waffles. Una ficha de cupones en internet se
contradice (niega y afirma un programa). No se usa.

Desconocido: si existe un club interno que el FAQ no menciona.

Lectura: el bono regalable es un producto de ocasión, distinto de la visita
repetida. Odoo ya separa gift card y loyalty. Conviene no mezclarlos en la
misma pantalla del MVP.

### Starbucks Rewards (Estados Unidos)

No es el programa de Colombia. Se incluye porque es la referencia global que
el brief pidió, y porque cambió en 2026. Fuentes:
[starbucks.com/rewards](https://www.starbucks.com/rewards),
[términos](https://www.starbucks.com/rewards/terms/) y el
[anuncio de marzo de 2026](https://about.starbucks.com/press/2026/starbucks-unveils-reimagined-loyalty-program-to-deliver-more-meaningful-value-personalization-and-engagement-to-members/).
La mecánica de Starbucks en Colombia queda desconocida.

| Pieza                         | Regla publicada para EE. UU.                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Niveles por Stars en 12 meses | Green al entrar. Gold con 500 Stars. Reserve con 2.500 Stars una vez en Gold. El estado dura 12 meses y hay que recalificar          |
| Tasa                          | Green 1 Star por US$1. Gold 1,2. Reserve 1,7. No hay Stars en recarga de tarjeta, alcohol, impuesto ni propina                       |
| Recarga digital               | Bonus Stars por recargas de US$30 o más, y más por US$50 o más                                                                       |
| Canje                         | Niveles de Stars con tope en dólares del ítem (por ejemplo US$6 en 100 Stars para café de filtro o panadería, en el FAQ de la marca) |
| Vencimiento                   | Green: 6 meses, extensible un mes con compra, canje o recarga calificada. Gold y Reserve: no vencen                                  |
| Extra de estado               | Cumpleaños con ventana más larga al subir; Free Mod Mondays; Double Star Days adicionales; eventos en Reserve                        |
| App                           | Es el canal del programa, de la tarjeta y del pedido                                                                                 |

Lectura útil sin copiar el esquema: el estado acelera la acumulación, el
canje tiene precio tope para proteger margen, y la recarga de saldo es un
acelerador aparte. Para Libertario el saldo almacenado tiene costo legal y
de conciliación; no entra al MVP.

## Comparación de mecánicas

|             | Leal                          | MiMcDonald's CO                  | Juan Valdez                                    | Tostao'                    | Crepes                               | Starbucks EE. UU.                           |
| ----------- | ----------------------------- | -------------------------------- | ---------------------------------------------- | -------------------------- | ------------------------------------ | ------------------------------------------- |
| Moneda      | Puntos por marca y Leal Coins | Puntos                           | Puntos                                         | Gasto del mes              | Bono en pesos                        | Stars                                       |
| Nivel       | No publicado                  | No publicado                     | Visitas y/o puntos, semestre                   | Gasto del mes              | No publicado                         | Stars en 12 meses                           |
| ID en caja  | Documento                     | QR o cédula                      | Código de barras de la cédula                  | Cédula dicha en caja       | No aplica en el FAQ                  | App / tarjeta                               |
| Canje       | Código de 4 dígitos o SMS     | Solo dentro del pedido de la app | Catálogo en tienda; pago con puntos en la app  | Cupón el mes siguiente     | Bono                                 | Ítem con tope de precio                     |
| Vencimiento | No leído                      | 6 meses                          | 1 año, FIFO                                    | El mes                     | El del bono                          | 6 meses solo en el nivel base               |
| Terceros    | Es la red                     | Excluye otro e-commerce          | Canales que la marca liste                     | Solo tienda física         | Bonos de terceros como medio de pago | El anuncio ata el earn al café participante |
| Factura     | Desconocido                   | Desconocido en el FAQ            | Sin factura a nombre del miembro no hay puntos | Carga en portal hasta 48 h | Factura del bono, no de un club      | Desconocido en esta lectura                 |

Patrones que se repiten y que un diseño propio puede tomar como problema, no
como especificación:

1. Identificar antes de pagar. Si no, el punto no existe.
2. El canje tiene que golpear el mismo documento que la cocina y el fisco.
3. El nivel y el punto no tienen por qué ser la misma cuenta.
4. Lo que no acumula (canje, recarga, propina, impuesto) hay que decirlo.
5. Un código corto en caja reduce fricción y también se filtra; hace falta
   vencimiento y un solo uso.
6. La red multimarca (Leal, Puntos Colombia) diluye la marca. Libertario
   compite por hábito en tienda propia.

La geocerca, el pase con sellos, el QR de mesa y la comparación con el
pedido de WeChat o Alipay están en
[experiencia-tienda.md](experiencia-tienda.md). Ahí también quedaron dos
decisiones del MVP: el pago es en caja, y la promo es un push nativo de la
geocerca de la app. La ubicación del Wallet es un extra opcional.

## Integración POS, en abstracto

Ninguna fuente pública de arriba entrega el contrato técnico con el POS. Lo
que sí se ve es el momento operativo:

```text
cliente identificado
  → ticket con ítems elegibles
  → pago
  → acreditación (inmediata o en horas)
canje
  → se aplica al ticket o al pedido de la app
  → se descuenta la moneda
  → esa línea no vuelve a generar moneda
```

Para Libertario ese dibujo ya tiene dueño: Odoo POS, el programa de loyalty
nativo y la factura electrónica. El detalle está en la propuesta. REA no
sustituye una orden de prueba en el POS.

## Preguntas que siguen abiertas

| Pregunta                                                                 | Estado                                                                                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Tasa vigente de MiMcDonald's Colombia                                    | Abierta. El FAQ leído no la repite; la prensa de lanzamiento sí                                           |
| Umbrales exactos Gourmet y Supremo de Tostao'                            | Abierta por la grafía del PDF                                                                             |
| Programa propio de Crepes & Waffles                                      | Abierto. El FAQ oficial habla de bonos                                                                    |
| Starbucks en Colombia                                                    | Abierto. No usar la tabla de EE. UU.                                                                      |
| Tasa de puntos de cada marca dentro de Leal                              | Abierta                                                                                                   |
| Versión exacta de Odoo en Libertario y reglas ya configuradas de loyalty | Abierta. La página pública muestra apps y un módulo de redención con Jorels; no es un inventario auditado |
| Si una sesión propia de cliente viola algún término al tomar notas       | Abierta hasta leer el término de cada app el día de la visita                                             |
| Geocerca de MiMcDonald's en Colombia                                     | Abierta. Lo publicado con detalle es de Estados Unidos                                                    |
| Pases de Wallet de estas marcas                                          | Abierta. No aparecieron en las páginas leídas                                                             |
| Pago en mesa frente a pago en caja, para Libertario                      | Cerrada: se paga en caja. Ver la experiencia de tienda                                                    |
| Push de la app frente a ubicación del Wallet                             | Cerrada: push nativo con geocerca. El Wallet es extra                                                     |

Esas filas no se cierran con ingeniería inversa del binario.
