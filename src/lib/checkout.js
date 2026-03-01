/**
 * checkout.js — Darkclub Checkout Orchestrator
 * ──────────────────────────────────────────────
 * Verifica se o usuário é Membro Darkclub verificado
 * e escolhe o Price ID correto antes de redirecionar.
 *
 * Fluxo:
 *   1. saveFirstDossier(slug, payload)  — salva rascunho
 *   2. createCheckoutSession(user)      — determina preço
 *   3. stripe.redirectToCheckout(...)   — redireciona
 */

import { supabase } from './supabase';
import { getStripe, PRICES } from './stripe';
import { saveDossier } from './storage';

// ── Step 1: Determinar o Price ID correto ─────────────────────
async function resolvePriceId(userId) {
    if (!supabase || !userId) return PRICES.standard;

    const { data: profile } = await supabase
        .from('profiles')
        .select('darkclub_verified, darkclub_url')
        .eq('id', userId)
        .single();

    const isMember =
        profile?.darkclub_verified === true &&
        profile?.darkclub_url?.trim().length > 0;

    return isMember ? PRICES.member : PRICES.standard;
}

// ── Step 2: Salvar rascunho e ir ao checkout ──────────────────
export async function publishAndCheckout({ slug, payload, user, onLoading }) {
    // Show luxury loading state
    onLoading?.('Salvando sua edição exclusiva...');

    // Save dossier to Supabase (status: 'draft' until payment confirms)
    const savePayload = { ...payload, status: 'draft', published: false };
    const { error: saveError } = await saveDossier(slug, savePayload);
    if (saveError) {
        onLoading?.(null);
        return { error: `Erro ao salvar: ${saveError}` };
    }

    onLoading?.('Verificando credenciais Darkclub...');

    // Determine correct price
    const priceId = await resolvePriceId(user?.id);

    onLoading?.('Processando sua edição exclusiva... Você será redirecionada para o checkout seguro.');

    // Load Stripe
    const stripe = await getStripe();
    if (!stripe) {
        onLoading?.(null);
        return { error: 'Stripe não configurado. Adicione VITE_STRIPE_PUBLISHABLE_KEY ao .env' };
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/dashboard?checkout=cancelled`,
        customerEmail: user?.email || undefined,
        // Pass slug in client_reference_id so webhook can activate the magazine
        clientReferenceId: slug,
    });

    onLoading?.(null);
    if (error) return { error: error.message };
    return { error: null };
}
