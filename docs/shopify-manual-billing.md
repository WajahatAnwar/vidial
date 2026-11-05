# Shopify manual plans

Frontend seam: set `SHOPIFY_MANUAL_PLAN_CHARGE_URL` in `resources/js/ReactJs/MyApplication/shopifyManualPlanCharge.js` to:

`/api/billing/manual-plan-charge`

Plan names are the database names: **Free, Standard, Premium, Enterprise**. There is no Advanced plan. Do not rename the database.

## Charge request

`POST /api/billing/manual-plan-charge` (`billing.manual-plan-charge`)

Middleware: `verify.shopify`, same bearer session as `GET /get-plans`. The embedded app already sends `Authorization: Bearer` and `Accept: application/json`.

```json
{ "plan_id": 14 }
```

`plan_id` is `data[].id` from `GET /get-plans`. `host` is optional; when the body omits it, the referer query string is used so Shopify can return into the embedded app.

### Charge needed

```json
{ "success": true, "confirmation_url": "https://admin.shopify.com/...", "confirmationUrl": "https://admin.shopify.com/..." }
```

`confirmation_url` is an absolute https Shopify confirmation URL. `confirmationUrl` is the same value. App Bridge opens it with `window.open(url, "_top")`.

### Freemium, no charge

Only when `SHOPIFY_BILLING_FREEMIUM_ENABLED=true` and the plan price is 0. Default is false, so Free still creates a Shopify charge and quotas keep an ACTIVE charge period.

```json
{ "success": true, "freemium": true, "message": "Free plan is active." }
```

### Declined

```json
{ "success": false, "error": "declined", "message": "The charge was declined." }
```

### Any other failure

```json
{ "success": false, "error": "billing_disabled", "message": "Shopify billing is disabled." }
```

`error` is a short code (`unknown_plan`, `plan_not_recurring`, `charge_create_failed`, `shop_required`, `plan_required`). HTTP is non-200. `success` is false.

## Return to /plans

Shopify sends the merchant to `GET /billing/process/{planId}`. That route activates the charge, then redirects to `/plans` with:

- Accepted: `charge_status=accepted`, `status=accepted`, `charge_id`
- Declined or missing charge: `error=declined`, `charge_status=declined`, `status=declined`, and `charge_id` when Shopify sent one
- `shop` and `host` are kept so the embedded app can reload

`/plans` is not behind `billable`, so a shop with no charge can still open Plans and read `error=declined`, `error=freemium`, `freemium=1`, `charge_status`, `status`, and `charge_id`.

`GET /billing/{planId}` remains the package full-page redirect. The Plans screen does not call it.

## Quotas

`update.plan` uses the newest charge with `status = ACTIVE`. Limits are that charge's plan `ugc_video_count` and `ugc_email_count`, then `users.plan_id` if the charge has no plan. The window is the charge `created_at` through 30 days. No Mantle call.

## Ops

Do not write `.env` or run seeders on Cloudways `~/public_html`. That host is production (`APP_ENV=production`, `APP_URL=app.goodauthentic.com`). Wait until Sanwal confirms a staging host. Leave Mantle env vars as they are until then.

When a staging host exists:

- `SHOPIFY_BILLING_ENABLED=true` (git default is false)
- `SHOPIFY_BILLING_FREEMIUM_ENABLED=false` so Free is a real charge
- `SHOPIFY_BILLING_REDIRECT=/billing/process`
- `SHOPIFY_BILLING_TEST=true` for newly seeded rows only
- Leave `SHOPIFY_MANUAL_ROUTES` unset, or include `billing.process`, so the return lands on `/plans`
- Partner Dashboard pricing must be manual, not Managed pricing. This repo has no Partner Dashboard plan IDs
- `php artisan db:seed --class=PlanSeeder` inserts a missing Free, Standard, Premium, or Enterprise row and fixes an invalid `type` / `interval` on the latest row of that name. It does not change existing price or `ugc_*` counts and does not rename Advanced
- The package screen with no plan id uses `on_install = 1`. Point that flag at the Free row `get-plans` returns before enabling billing
- Free's stored `capped_amount` of `1.00` is the existing row. If Shopify rejects that charge, set `capped_amount` to `0` on staging only

`users.mantle_token` and `users.customer_api_token` stay. This path does not write them or call `appapi.heymantle.com`.
