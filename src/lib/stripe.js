import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise = null;

export function getStripe() {
    if (!stripePromise && stripeKey) {
        stripePromise = loadStripe(stripeKey);
    }
    return stripePromise;
}

// ── Stripe Product/Price Config ──────────────────────────────
// Product IDs from Stripe Dashboard
export const PRODUCTS = {
    standard: 'prod_U42bO2LvujRpKs',   // R$ 19,90/mês
    member: 'prod_U42c2AwmDjQ7O6',   // R$ 10,90/mês (darkclub verified)
};

// Price IDs — needed for Checkout
// Go to Stripe Dashboard → Products → click each product → copy the Price ID (starts with price_)
// Replace these with your real price IDs:
export const PRICES = {
    standard: 'price_1T5uWQRqpX5sCieCHHPZbuRX',   // R$ 19,90/mês
    member: 'price_1T5uXTRqpX5sCieC6EeBS9OV',   // R$ 10,90/mês (darkclub verified)
};

/**
 * Redirect to Stripe Checkout.
 * Uses Payment Links as fallback if price IDs aren't configured.
 */
export async function redirectToCheckout(priceId, customerEmail) {
    const stripe = await getStripe();
    if (!stripe) {
        console.warn('[Stripe] Not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
        alert('Stripe não configurado. Adicione a chave no .env');
        return;
    }

    // Proceed to checkout

    const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/`,
        customerEmail,
    });

    if (error) {
        console.error('[Stripe]', error.message);
        alert('Erro no checkout: ' + error.message);
    }
}
