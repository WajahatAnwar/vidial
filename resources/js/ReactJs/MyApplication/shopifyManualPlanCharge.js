/**
 * Shopify Manual Plan charge confirmation (App Bridge).
 *
 * Vidial Backend owns the charge-confirm route. It is not in this tree yet,
 * so this module does not call a guessed path. When Backend publishes the
 * contract, set SHOPIFY_MANUAL_PLAN_CHARGE_URL and this UI will POST and open
 * the returned confirmation URL with App Bridge.
 *
 * Expected request (same session as get-plans; the embedded layout adds
 * Authorization: Bearer <Shopify id token> on window.fetch):
 *   POST <SHOPIFY_MANUAL_PLAN_CHARGE_URL>
 *   Content-Type: application/json
 *   Body: { "plan_id": <id from get-plans data[].id> }
 *
 * Expected JSON (200):
 *   { "success": true, "confirmation_url": "https://..." }
 *   confirmationUrl is accepted as an alias of confirmation_url.
 *   The URL must be absolute https. App Bridge opens it with window.open(url, "_top").
 *
 * Freemium (no Shopify charge; Plans refreshes quotas from get-plans):
 *   { "success": true, "freemium": true, "message": "optional" }
 *   or { "success": false, "error": "freemium", "message": "optional" }
 *
 * Declined charge, either as the POST response or when Shopify returns the
 * merchant to /plans:
 *   { "success": false, "error": "declined", "message": "optional" }
 *   /plans?error=declined
 *   /plans?charge_status=declined
 *   /plans?status=declined
 *   Optional message query param is shown when present.
 *
 * Accepted return (Plans refreshes get-plans and shows current quotas):
 *   /plans?charge_status=accepted
 *   /plans?status=accepted
 *   /plans?charge_id=<id> with no error param
 *
 * Any other failure:
 *   { "success": false, "error": "string", "message": "optional" }
 *   or a non-OK response.
 *
 * TODO(backend): replace SHOPIFY_MANUAL_PLAN_CHARGE_URL = null with the
 * published path or absolute URL. Do not point this at Mantle.
 *
 * GET /billing/{plan} from the Shopify package is a server redirect, not this
 * contract. This module does not call that route.
 */

export const SHOPIFY_MANUAL_PLAN_CHARGE_URL = null;

const PLAN_ORDER = ['free', 'standard', 'premium', 'enterprise'];

function planNameKey(plan) {
    return String(plan?.name || '').trim().toLowerCase();
}

function planRank(plan) {
    const key = planNameKey(plan) === 'advanced' ? 'enterprise' : planNameKey(plan);
    const rank = PLAN_ORDER.indexOf(key);
    return rank === -1 ? PLAN_ORDER.length : rank;
}

export function sortPlanCards(plans) {
    const list = Array.isArray(plans) ? plans : [];
    return [...list].sort((a, b) => {
        const aOrder = planRank(a);
        const bOrder = planRank(b);
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        return Number(a?.id || 0) - Number(b?.id || 0);
    });
}

/**
 * Ops plan names are Free, Standard, Premium, Enterprise.
 * If get-plans still returns Advanced, show that row as Enterprise and keep
 * its id so Select plan POSTs the id the API actually returned.
 * When Enterprise is already present, drop the temporary Advanced row.
 */
export function presentPlanCards(plans) {
    const list = Array.isArray(plans) ? plans : [];
    const hasEnterprise = list.some((plan) => planNameKey(plan) === 'enterprise');
    const visible = list.reduce((cards, plan) => {
        const key = planNameKey(plan);
        if (key === 'advanced') {
            if (hasEnterprise) {
                return cards;
            }
            cards.push({ ...plan, name: 'Enterprise' });
            return cards;
        }
        cards.push(plan);
        return cards;
    }, []);
    return sortPlanCards(visible);
}

export function isShopifyConfirmationUrl(value) {
    if (typeof value !== 'string' || value.trim() === '') {
        return false;
    }
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
}

export function readChargeReturnState(search) {
    const query = typeof search === 'string' ? search : '';
    const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
    const explicit = String(
        params.get('error') || params.get('charge_status') || params.get('status') || ''
    ).trim().toLowerCase();
    const message = params.get('message');
    const freemium = String(params.get('freemium') || '').trim().toLowerCase();

    if (explicit === 'declined' || explicit === 'decline') {
        return { kind: 'declined', message };
    }
    if (explicit === 'freemium' || freemium === '1' || freemium === 'true') {
        return { kind: 'freemium', message };
    }
    if (explicit === 'accepted' || explicit === 'active') {
        return { kind: 'accepted', message };
    }
    if (params.get('charge_id') && !explicit) {
        return { kind: 'accepted', message };
    }
    if (explicit) {
        return { kind: 'error', message: message || explicit };
    }
    return null;
}

export function classifyChargeResponse(payload) {
    const body = payload && typeof payload === 'object' ? payload : {};
    const error = String(body.error || '').trim().toLowerCase();
    const message = typeof body.message === 'string' ? body.message : null;

    if (body.freemium === true || error === 'freemium') {
        return { kind: 'freemium', message };
    }
    if (body.success === false && (error === 'declined' || error === 'decline')) {
        return { kind: 'declined', message };
    }
    if (body.success === false) {
        return {
            kind: 'error',
            message: message || 'The Shopify charge could not be started.',
        };
    }

    const confirmationUrl = body.confirmation_url || body.confirmationUrl;
    if (isShopifyConfirmationUrl(confirmationUrl)) {
        return { kind: 'redirect', confirmationUrl };
    }
    if (confirmationUrl) {
        return {
            kind: 'error',
            message: 'Shopify returned a charge confirmation URL that is not an absolute https URL.',
        };
    }
    return {
        kind: 'error',
        message: message || 'Shopify charge confirmation URL was not returned.',
    };
}

/**
 * App Bridge, loaded by the embedded Shopify layout, patches window.open so
 * target "_top" leaves the admin iframe for Shopify's charge confirmation page.
 */
export function openShopifyChargeConfirmation(confirmationUrl) {
    if (!isShopifyConfirmationUrl(confirmationUrl)) {
        throw new Error('Missing Shopify charge confirmation URL.');
    }
    const opened = window.open(confirmationUrl, '_top');
    if (opened == null) {
        window.location.assign(confirmationUrl);
    }
}

export async function requestShopifyManualPlanCharge(planId, fetchImpl = globalThis.fetch) {
    if (!SHOPIFY_MANUAL_PLAN_CHARGE_URL) {
        return {
            kind: 'pending_contract',
            message: null,
        };
    }

    const response = await fetchImpl(SHOPIFY_MANUAL_PLAN_CHARGE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId }),
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok && (!payload || payload.success !== false)) {
        return {
            kind: 'error',
            message: payload?.message || `Charge request failed (${response.status}).`,
        };
    }

    return classifyChargeResponse(payload);
}
