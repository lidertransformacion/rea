/**
 * La web no enciende estas piezas. Quedan preparadas para el binario
 * nativo, cuando existan las cuentas de Apple y de Google. Sin deploy.
 */
export const nativo = {
  geocerca: false,
  aviso: false,
  wallet: false,
} as const;

export const NOTA_NATIVO =
  "La llegada a la sede, el aviso en el teléfono y la tarjeta de Wallet quedan para la app nativa. Aquí están apagados. Apple y Google siguen pendientes.";
