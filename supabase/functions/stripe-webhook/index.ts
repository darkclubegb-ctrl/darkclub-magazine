// @ts-nocheck — Deno ESM imports: resolve at runtime, not in VS Code TS engine
// supabase/functions/stripe-webhook/index.ts
// ════════════════════════════════════════════════════════════
// Darkclub — Stripe Webhook Handler (Deno / Supabase Edge)
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Required Secrets (supabase secrets set):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_SERVICE_ROLE_KEY
// ════════════════════════════════════════════════════════════

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // service role bypasses RLS
);

Deno.serve(async (req) => {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET')!
        );
    } catch (err) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // ── Handle: checkout.session.completed ──────────────────
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // clientReferenceId = model slug (set in checkout.js)
        const slug = session.client_reference_id;
        const customerEmail = session.customer_details?.email;
        const subscriptionId = session.subscription as string;

        console.log(`[Webhook] Payment confirmed — slug: ${slug}, email: ${customerEmail}`);

        if (slug) {
            // 1. Activate the magazine
            const { error: modelError } = await supabase
                .from('models')
                .update({
                    status: 'active',
                    published: true,
                    stripe_subscription_id: subscriptionId,
                    activated_at: new Date().toISOString(),
                })
                .eq('slug', slug);

            if (modelError) {
                console.error('[Webhook] Failed to activate model:', modelError.message);
            } else {
                console.log(`[Webhook] ✓ Magazine activated: /modelo/${slug}`);
            }
        }

        // 2. Update profile: link subscription
        if (customerEmail) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', customerEmail)
                .single();

            if (profile?.id) {
                await supabase
                    .from('profiles')
                    .update({
                        stripe_subscription_id: subscriptionId,
                        subscription_status: 'active',
                        subscription_started_at: new Date().toISOString(),
                    })
                    .eq('id', profile.id);

                console.log(`[Webhook] ✓ Profile updated for: ${customerEmail}`);
            }
        }
    }

    // ── Handle: customer.subscription.deleted ───────────────
    if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[Webhook] Subscription cancelled: ${sub.id}`);

        // Deactivate the magazine
        await supabase
            .from('models')
            .update({ status: 'draft', published: false })
            .eq('stripe_subscription_id', sub.id);

        await supabase
            .from('profiles')
            .update({ subscription_status: 'cancelled' })
            .eq('stripe_subscription_id', sub.id);
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
});
