# Análisis de REA 6.5.0

Notas internas de Libertario Coffee Roasters. No son una guía oficial de REA
y están excluidas del sitio VitePress (`docs/.vitepress/config.ts`).

Fecha de la corrida: 14 de octubre de 2026. Entorno: Ubuntu 24.04, Node.js
24.18.0 y npm 11.16.0, sobre el checkout de este repositorio (`rea-agents`
6.5.0). El `node` que venía primero en `PATH` era 22.14.0, por debajo del
rango de `package.json` (`^22.19.0 || ^24.11.0 || >=26.0.0`). La corrida usó
el binario de nvm que corresponde a `.nvmrc`.

## Qué es

REA (Reverse Engineer Anything) es una herramienta local de análisis. El mismo
flujo de aplicación se usa desde la terminal (`rea`) y desde un servidor MCP
que un agente puede llamar. No es un descompilador propio: orquesta motores
que el operador aporta (Ghidra, Hopper, IDA, JADX y otros) y, para varios
formatos, lee el artefacto sin ejecutarlo.

El paquete publicado es `rea-agents`. En este checkout el ejecutable es
`scripts/rea.mjs`, que exige el runtime compilado en `dist/`.

El proyecto declara un uso lícito: investigación, interoperabilidad,
preservación, depuración y auditoría de software propio o autorizado. El
[disclaimer](../DISCLAIMER.md) excluye evadir protecciones, copiar software
propietario y saltarse controles de acceso. Esa frontera se mantiene en el
[estudio de fidelización](estudio-fidelizacion.md).

## Cómo se instaló y se ejecutó

Comandos reales, en `/workspace`, con Node 24.18.0:

```bash
npm ci
npm run build:cached
node scripts/rea.mjs doctor --json
node scripts/rea.mjs providers --json
node scripts/rea.mjs capabilities --json
node scripts/rea.mjs setup --client cursor --skill=false --dry-run --json
```

| Paso                   | Resultado observado                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `npm ci`               | 544 paquetes, 0 vulnerabilidades reportadas por npm, unos 7 s                                 |
| `npm run build:cached` | Turbo 2.11.7, 3 tareas exitosas, 6,998 s. Compiló el runtime y generó metadatos del skill     |
| `rea doctor --json`    | El proceso arranca. `healthy: false` por motores y registro ausentes, no por un fallo del CLI |
| `rea setup --dry-run`  | `status: "planned"`. No escribió `~/.cursor/mcp.json`                                         |

`doctor` en esta máquina:

| Chequeo         | Estado  | Detalle                                                                 |
| --------------- | ------- | ----------------------------------------------------------------------- |
| Node            | sano    | 24.18.0                                                                 |
| Host            | sano    | Ubuntu 24.04                                                            |
| Hopper          | ausente | no hay launcher                                                         |
| Ghidra          | ausente | `GHIDRA_INSTALL_DIR` no está definido. Pide un Ghidra 12.1.x extraído   |
| IDA             | ausente | no hay `REA_IDA_MCP_CONFIG`                                             |
| JADX            | ausente | no hay `REA_JADX_MCP_JAR` (jadx-headless-mcp 0.7.1). REA no lo descarga |
| Skill instalado | ausente | la copia de usuario no está; el skill del repo sí existe                |
| Registro Cursor | ausente | `/home/ubuntu/.cursor/mcp.json` no tiene el servidor                    |

Java 21 está instalado. No se instaló Ghidra, Hopper, JADX ni IDA: REA los
trata como bring-your-own y el instalador no debe agregar software ajeno.
`ps` de procps-ng 4.0.4 está en `PATH`, que es el requisito Linux para
comprobar propiedad de procesos.

Identidad reportada por `doctor`:

- CLI `6.5.0`
- skill esperado `42` (`reverse-engineer-anything`)
- SDK MCP `2.3.1`
- catálogo: 153 comandos CLI, 207 herramientas MCP, 6 prompts

El plan de setup, sin aplicar, proponía una sola acción: crear el registro
MCP de Cursor apuntando a `scripts/rea.mjs mcp`, con backup del archivo
inspeccionado. No se aplicó. Registrar el servidor en este agente de nube no
era necesario para los ejemplos CLI y habría escrito configuración local.

CPU, memoria pico y tokens de un agente no se midieron. Los tiempos de abajo
son de reloj de pared de esta máquina.

## Arquitectura

Las dependencias van hacia adentro: dominio, contratos, adaptadores de
proveedor, flujos de aplicación compartidos, y al final CLI o MCP. El mapa
está en [docs/architecture.mermaid](architecture.mermaid).

```text
scripts/rea.mjs
  ├─ mcp            → dist/mcp/main.js          servidor stdio
  └─ un comando     → dist/cli-runtime/cli.js   proceso de un solo uso

src/composition/    fabrica proveedores y la sesión
src/application/    flujos compartidos CLI/MCP, investigaciones, grafos JS
src/server/         traducción MCP
src/domain/         evidencia, comparaciones y grafos, sin efectos
src/contracts/      esquemas que ve quien llama
src/process/        procesos propios, plazos, limpieza
src/config/         entorno validado
```

Cada proveedor vive en su carpeta (`src/ghidra/`, `src/hopper/`, `src/ida/`,
`src/android/`, `src/dotnet/`, `src/browser/`, `src/firmware/`, y otras) y
adapta un motor externo o un lector propio. El dominio no conoce el protocolo
de Hopper ni el puente Java de Ghidra.

Una sesión de binario nativo ata un objetivo a un proveedor. No hay
fallback silencioso si hay varios candidatos: hay que elegir. Los comandos
CLI de un solo uso no comparten esa sesión; cada invocación es un proceso.
Para reutilizar un resultado nativo se usa un snapshot local.

## Evidencia

La unidad de respuesta es un registro de Evidence. En las corridas de esta
nota el sobre trae, entre otros campos:

- `evidence_id`
- `subject` (nombre, SHA-256, ruta, formato)
- `provider`
- `operation` y `parameters`
- `normalized_result` y, si existe, `raw_result`
- `confidence`, `authority`
- `limitations`
- `locations` y `evidence_links`

Hay que leer tres planos distintos:

| Plano                    | Qué afirma                                           |
| ------------------------ | ---------------------------------------------------- |
| `confidence: observed`   | el lector vio bytes o un hecho del artefacto         |
| `confidence: derived`    | REA construyó un resultado a partir de esas lecturas |
| arista `state: inferred` | una relación estática es candidata, no una ejecución |
| `limitations`            | lo que el resultado no prueba                        |

Un análisis estático no observa ejecución. Una cobertura `complete` significa
que el recorrido declarado terminó, no que el programa se haya entendido por
completo. La ausencia de metadatos Go no demuestra que el binario no sea Go.

## Cómo se usa

Desde el checkout, después de `npm ci` y `npm run build:cached`:

```bash
node scripts/rea.mjs --help
node scripts/rea.mjs doctor --json
node scripts/rea.mjs <comando> <ruta-absoluta> --json
```

El paquete publicado equivale a `npx -y rea-agents@latest <comando>`. La
versión de esta nota es la 6.5.0 del árbol local, no necesariamente la última
de npm.

Flujo corto para un agente o una persona:

1. Elegir el comando por el tipo de artefacto, no por la extensión.
2. Pedir el resultado por defecto o `detail: summary` si el artefacto es grande.
3. Guardar el JSON y proyectar una vista (`inspect-analysis-view`) en lugar de
   releer cientos de megabytes.
4. Separar observación, inferencia y desconocido antes de concluir.
5. Cerrar la sesión nativa (`close_binary` en MCP) al terminar.

JavaScript y Electron no necesitan motor nativo. Un directorio o un ASAR:

```bash
node scripts/rea.mjs analyze-javascript-application /ruta/absoluta --json
```

.NET, Go embebido, Rust `cargo-auditable`, SQLite, recursos PE y el inventario
de archivos tampoco abren Ghidra. Pseudocódigo nativo sí: `analyze`,
`decompile`, `function`, `xrefs` y `trace` piden `--provider ghidra`, `hopper`
o `ida`.

`rea providers` y `rea capabilities` describen la sesión de binario, no el
catálogo completo. En esta corrida, sin objetivo abierto, `open` era `false`
y el enlace de proveedor era nulo. Los candidatos nativos listados fueron
Ghidra, Hopper e IDA, ninguno disponible. El catálogo de 207 herramientas está
en la identidad del servidor; las guías de `docs/` dicen el prerrequisito de
cada una.

## Capacidades que importan para producto

Superficie relevante para estudiar una app de fidelización, con el
prerrequisito y el límite principal. La autoridad sigue siendo del operador:
poseer un archivo no autoriza todas las operaciones.

| Pregunta de producto                                  | Camino REA                                                          | Prerrequisito                              | Límite                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| Módulos, imports, IPC, rutas de una app JS o Electron | `analyze-javascript-application`, luego `trace-application-feature` | Node y, en Linux, `ps`                     | No ejecuta el bundle. Import dinámico u ofuscado queda sin resolver         |
| Inventario de un APK, IPA, ZIP o ASAR                 | `inspect-artifact`                                                  | lector de archivos de REA                  | El inventario no es el comportamiento                                       |
| Manifest, clases y métodos Android                    | `inspect-android-package` y herramientas Android                    | JDK y JADX headless que aporta el operador | No es una corrida de la app. No evade empaquetado protegido                 |
| Recursos Android legibles                             | `decode-android-resources`                                          | Apktool aportado                           | No recupera lógica nativa                                                   |
| Identidad Flutter (hash de snapshot, ABI)             | `identify-flutter-build`                                            | solo el APK                                | No decompila Dart AOT a fuente original                                     |
| Ensamblado .NET                                       | `inspect-managed-artifact`                                          | ninguno                                    | No desempaqueta single-file ni IL2CPP                                       |
| Metadatos Go o dependencias Rust auditables           | `inspect-go-binary`, `inspect-rust-binary`                          | ninguno                                    | No es desensamblado                                                         |
| Base SQLite ya copiada y en reposo                    | `inspect-sqlite-database`                                           | Node 24.15+ o 26+                          | No abre la base viva ni recupera borrados. Cifrado queda fuera              |
| Página web propia o pública, con acciones declaradas  | `inspect-web-page`, `capture-browser-scenario`                      | navegador de la familia Chrome             | Ejecuta el escenario declarado. No autoriza una cuenta ajena                |
| HAR o SAZ ya capturado                                | `inspect-web-network-capture`                                       | el archivo                                 | No vuelve a pedir las URL grabadas ni atribuye tráfico en vivo              |
| Binario nativo                                        | `open_binary` y luego análisis                                      | Ghidra, Hopper o IDA                       | Pseudocódigo no es fuente. Ghidra en Windows no tiene autoridad de mutación |

Quedan fuera del uso propuesto para Libertario: Frida, depuradores, ADB sobre
un dispositivo que no sea propio, captura de paquetes de redes ajenas y
cualquier flujo que evada una protección. Esos comandos existen en el
catálogo; no forman parte del estudio.

## Límites observados en esta máquina

- Sin Ghidra, Hopper o IDA no hay pseudocódigo ni grafo de llamadas nativo.
- Sin JADX no hay métodos Android.
- `inspect-go-binary /usr/bin/ls` leyó un ELF x86_64 de 142312 bytes y devolvió
  `build_info: null`. Evidence
  `ev_94b9197b24e5a94524a9daa08bf53b295c079f6aa69d5bcbc2b8a305a2495dd0`,
  `confidence: observed`. La limitación dice que la ausencia del registro no
  prueba que el binario no sea Go, y que no se recuperan funciones ni
  decompilación.
- Las utilidades nativas de macOS salen `unsupported_host`.
- Un CLI no conserva la sesión. El JSON grande hay que guardarlo.
- El resultado puede ser enorme en una app real. La guía de CLI cita un
  Evidence de Obsidian de unos 334 MB reducido a un resumen de unos 10 KB.
- Setup no instala Node, Java, Ghidra, IDA, JADX, Binwalk ni Unblob.
- Los resultados pueden estar incompletos o ser incorrectos. No conceden
  derechos sobre el programa analizado.

## Ejemplos que sí corrieron

Los dos artefactos son propios, creados para esta nota en `/tmp/rea-demo`.
No son apps de terceros.

### JavaScript estático

Directorio `loyalty-sample`: `package.json`, `src/index.js` y `src/ledger.js`.
`index.js` importa `earnPoints` y `redeem` desde `./ledger.js`.

```bash
node scripts/rea.mjs analyze-javascript-application \
  /tmp/rea-demo/loyalty-sample --json
```

Reloj de pared: 1182 ms. Salida: 149564 bytes. Evidence
`ev_3ddc299e7a7a01a02251ff867b33162b54dfc9a1dee2fd983e2b25332ea119bd`.

| Hecho                  | Valor                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Confianza del registro | `derived`                                                          |
| Autoridad              | `shipped-artifact`                                                 |
| Proveedor              | `rea-javascript-application` 1                                     |
| SHA-256 del directorio | `9ae07dcabd269d391d5e5cdf8b7a5d45214ce176e9ffb26f6c6c857f484ce6fb` |
| Archivos relevantes    | 3                                                                  |
| JavaScript parseado    | 2                                                                  |
| Bytes de texto         | 863                                                                |
| Nodos AST visitados    | 102                                                                |
| Fallos de parseo       | 0                                                                  |
| Grafo                  | 10 nodos, 12 aristas, cobertura `complete`                         |
| Límites de Electron    | 0 ventanas, 0 IPC, 0 addons nativos                                |

Aristas que el grafo sostuvo:

- `contains` de `package.json`, `src/index.js` y `src/ledger.js`, con
  autoridad `artifact-bytes` y confianza `exact`.
- `imports` de `./ledger.js` resuelto a `src/ledger.js`, nombres `earnPoints`
  y `redeem`. Autoridad `static-relationship-inference`, estado `inferred`,
  confianza `high`.
- `exposes` de `earnPoints`, `redeem` y `previewVisit`.

La limitación repetida en esas aristas: la sintaxis estática no prueba que la
relación se ejecute, y no se ejecutó JavaScript. Eso es el producto funcionando
como está diseñado.

El progreso fue a stderr en fases (`parse_javascript_source`,
`build_javascript_application_graph`, `hash_javascript_application_evidence`)
y el JSON final quedó en stdout.

### SQLite en reposo

Base propia `loyalty.sqlite`, tablas `members` y `ledger`, una fila de
ejemplo. Motor reportado: SQLite 3.53.1, el de Node.

Inventario de esquema, 811 ms, Evidence
`ev_5fe71b0ffcfb360502c57a67e2144a18e27a3d25a484930146bbd23e281da21e`:

- `confidence: observed`
- dos tablas, completitud de inventario `complete`
- columnas `not_requested` porque no se pidió una tabla
- `wal: null`
- `rows: null`

Filas de `members` con `--table members --row-limit 5`, 869 ms, Evidence
`ev_b6d6221016f5fd70aa1b99b426f3e2e4adf38cad4d87e78ef456184bde065e46`:

- esquema de la tabla seleccionada, con el `CREATE TABLE`
- 1 fila devuelta, `truncated: false`, `order: unspecified`
- valores tipados (`integer` / `text`) y `bytes_hex` del texto

El lector copia en privado y no modifica el archivo de origen. No sirve para
una base cifrada, un WAL a medias o una recuperación forense.

### Paquete de Wallet y llegada a tienda

Sobre archivos propios, para la experiencia de tienda. El detalle y los
límites están en [experiencia-tienda.md](experiencia-tienda.md).

`inspect-artifact` sobre un `.pkpass` de muestra, sin firma, 1630 bytes.
Evidence `ev_387ec1818d0ba18e51d5cfe95c80afb977240348a7a925de8b2289a38bd16f4d`,
`confidence: observed`. Inventarió `pass.json`, `manifest.json`, `icon.png`,
`logo.png` y `strip.png`. No hay `signature`. La limitación dice que no
interpreta el formato: los puntos y los sellos escritos en el JSON no son
una lectura de REA.

`analyze-javascript-application` sobre el directorio `arrival`. Evidence
`ev_379041ebd06fa8c5f5715286ab196e9870ed5440c08cbf9d3486c34dabd96e5d`,
`confidence: derived`. El import `./menu.js` resolvió a `src/menu.js` con
estado `inferred`.

## Lectura para Libertario

REA sirve, en este repo y en esta máquina, para inspección estática de
JavaScript propio y de SQLite en reposo, y para diagnosticar qué motores
faltan. No está listo aquí para descompilar una app nativa o un APK.

Para el estudio de marcas de restaurante, el uso ajustado al disclaimer es
acotar preguntas, conservar evidencia y leer artefactos que Libertario pueda
examinar: la futura app propia, exportaciones que Odoo entregue, páginas
públicas y capturas de una sesión propia cuando el término del sitio lo
permita. No es un permiso para extraer el código de Leal, McDonald's o Juan
Valdez.

El plan de ese estudio está en [estudio-fidelizacion.md](estudio-fidelizacion.md).
La llegada a tienda, los pases y el QR de mesa están en
[experiencia-tienda.md](experiencia-tienda.md). La propuesta de producto,
sin construirla, está en
[propuesta-app-fidelizacion-libertario.md](propuesta-app-fidelizacion-libertario.md).
