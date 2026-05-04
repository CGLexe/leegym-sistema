// ===== LEE GYM — Configuración de Stripe =====
// Productos y precios creados en Stripe para LEE GYM

export const STRIPE_CONFIG = {
  // Productos de Stripe
  products: {
    mensual: {
      id: 'prod_USC6DOFdzZt5eo',
      priceId: 'price_1TTHibF9KvCGVOFkdBZUywFy',
      name: 'Membresía Mensual',
      price: 350, // MXN
      interval: 'month' as const,
      intervalCount: 1,
      durationDays: 30,
    },
    trimestral: {
      id: 'prod_USC6JvEJMmqjU0',
      priceId: 'price_1TTHicF9KvCGVOFkBgfHr3EE',
      name: 'Membresía Trimestral',
      price: 900, // MXN
      interval: 'month' as const,
      intervalCount: 3,
      durationDays: 90,
    },
    anual: {
      id: 'prod_USC6YCY3x6UTHX',
      priceId: 'price_1TTHidF9KvCGVOFk8XIqlVRf',
      name: 'Membresía Anual',
      price: 3000, // MXN
      interval: 'year' as const,
      intervalCount: 1,
      durationDays: 365,
    },
    paseDia: {
      id: 'prod_USC6viiT5FW3pj',
      priceId: 'price_1TTHieF9KvCGVOFkA9K2UdDg',
      name: 'Pase de Día',
      price: 80, // MXN
      interval: null,
      intervalCount: null,
      durationDays: 1,
    },
  },

  // Cupones de descuento
  coupons: {
    preventa15: {
      id: 'kvF7MJ0x',
      code: 'PREVENTA15',
      name: '15% Off Membresía Anual',
      type: 'percent_off' as const,
      value: 15,
    },
    fitness50: {
      id: '8q0vppam',
      code: 'FITNESS50',
      name: '$50 MXN Off Mensual',
      type: 'amount_off' as const,
      value: 5000, // centavos MXN
    },
    bienvenido: {
      id: 'FaXu6Bzo',
      code: 'BIENVENIDO',
      name: 'Inscripción $0',
      type: 'percent_off' as const,
      value: 100,
    },
  },

  // Métodos de pago soportados
  paymentMethods: [
    { id: 'stripe', label: 'Tarjeta (Stripe)', icon: '💳' },
    { id: 'efectivo', label: 'Efectivo', icon: '💵' },
    { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  ],
} as const;

// Helper para obtener producto por ID de membresía local
export function getStripeProduct(membresiaId: string) {
  const mapping: Record<string, keyof typeof STRIPE_CONFIG.products> = {
    'mensual': 'mensual',
    'trimestral': 'trimestral',
    'anual': 'anual',
    'pase_dia': 'paseDia',
  };

  const key = mapping[membresiaId];
  return key ? STRIPE_CONFIG.products[key] : null;
}

// Helper para obtener cupón por código
export function getStripeCoupon(code: string) {
  const coupons = Object.values(STRIPE_CONFIG.coupons);
  return coupons.find(c => c.code === code.toUpperCase()) || null;
}
