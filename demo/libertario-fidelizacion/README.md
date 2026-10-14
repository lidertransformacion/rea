# Demo local · fidelización Libertario

Un teléfono en el navegador, con la carta real y datos de prueba. No llama a
Odoo, no firma pases de Apple o Google y no envía SMS ni correo.

## Cómo levantarlo

Desde la raíz del repositorio, con Node 20 o superior:

```bash
node demo/libertario-fidelizacion/server.mjs
```

Abre [http://127.0.0.1:4173](http://127.0.0.1:4173). Otro puerto: `PORT=4180 node demo/libertario-fidelizacion/server.mjs`.

No hace falta `npm install` para este demo. Si alguna variable de entorno
apunta a `libertariocoffee.odoo.com`, el proceso se niega a arrancar.

## Qué se puede recorrer

1. **Bienvenida.** Portada de la marca.
2. **Alta.** Un paso: celular, correo, nombre y cédula.
3. **Casa.** Puntos, ocho sellos y la tarjeta. El saldo inicial (860 pts, 3 sellos) es de demostración.
4. **Tarjeta.** La misma tarjeta en grande. Wallet queda pendiente: no hay pase descargable.
5. **Llegada.** Eliges una sede de Bogotá. Sale la promo de esa tienda, con reloj de 45 minutos, y se abre su menú. La coordenada no se envía.
6. **Menú.** Búsqueda, categoría, rango de precio, “con mis puntos”, vegetal y orden. Precios y textos salen del PDF de la carta.
7. **Producto.** Canje con puntos, sumar a la mesa o registrar la compra de caja (suma puntos y un sello).
8. **Mesa.** QR, número de mesa, comanda sin pago y llamar al mesero.
9. **Caja de la mesa.** “Marcar cobrado en caja” acredita los puntos del pedido y un sello. Lo canjeado queda en $0 y no vuelve a sumar.

El octavo sello deja un filtrado PAZ de 8 oz para reclamar en caja y vacía la tira.

## De dónde salen los datos

`public/menu.json` copia nombres, precios y descripciones de la carta en PDF.
Las fotos son recortes de esa carta, pasados de CMYK a RGB. Las sedes son las
publicadas en libertariocoffee.com. El mapa es ilustrado.

El servidor guarda miembros, comandas y avisos al mesero solo en memoria.
Al cerrarlo, se borran. El navegador también recuerda la sesión en
`localStorage`.
