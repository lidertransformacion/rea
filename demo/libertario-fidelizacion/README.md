# Libertario

Demo local de la casa. Un solo proyecto Expo: la web sale como PWA y el mismo código queda listo para iOS y Android. No cobra, no llama a Odoo y no se despliega.

Los números son los del programa vigente: cada $100 en caja suman un punto; el bono de bienvenida son 1.000; el americano Paz o Libre cuesta 700, el cappuccino Paz o Libre 910 y el croissant de almendras 2.000. Los premios se piden hasta el 31 de diciembre de 2026. El historial se anota por sede, por ejemplo Libertario calle 93.

La interfaz es de Libertario, sobre blanco. El tueste y la tinta son acentos, no el fondo. Las otras apps solo sirvieron para ver qué tenía que poder hacerse. No se copió su aspecto ni su estructura.

## Web

```bash
cd demo/libertario-fidelizacion
npm ci
npm run web
```

Se abre en el puerto 8081. El arranque muestra la tostión y luego pide celular, correo, nombre y cédula.

El código del mostrador se calcula en el teléfono y se guarda en el almacenamiento local. Se ve sin red. La geocerca, el aviso y la tarjeta de Wallet están apagados: quedan para el binario nativo, cuando existan las cuentas de Apple y de Google.

Para dejar la web instalable:

```bash
npx expo export -p web
```

El manifiesto está en `public/manifest.json`. El service worker no se registra en localhost.

## Nativo

```bash
npm start
```

Ese comando abre el mismo proyecto. En un Mac, `npm run ios`. Con un emulador, `npm run android`. Hace falta un development build si se agregan módulos que Expo Go no trae. En Android de gama media el vidrio de la barra baja es un fondo sólido, sin blur, para no gastar el teléfono. En iOS y en la web el blur es ligero y solo está en esa barra y en la tarjeta del mostrador.

`src/nativo.ts` deja `geocerca`, `aviso` y `wallet` en falso. No se encienden en la web.

## Qué se recorre

1. Tostión, al abrir y al sumar una taza.
2. Alta en un paso. Entran 1.000 puntos de bienvenida.
3. Casa: saldo, lo que vence este mes, ocho tazas, el código del mostrador, lo que se cambia por puntos y el historial por sede.
4. Carta: búsqueda, índice, precio, vegetal, sin nueces. «Pasar la carta» abre el libro.
5. Mesa: código de la mesa, comanda, aviso en sala. El cobro no ocurre aquí.

Si `EXPO_PUBLIC_ODOO_URL` apunta a `libertariocoffee.odoo.com`, la demo no arranca.
