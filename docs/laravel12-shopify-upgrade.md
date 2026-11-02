# Vidial: Laravel 12 and Shopify offline-token upgrade

## Source and scope

Local branch: `upgrade/laravel12-shopify-offline`, based on deployed `origin/ga_v2` commit `334067a`.
Local `master` was 41 commits behind deployed code and was not used for the upgrade.
The server edits in `app/Models/User.php`, `resources/js/ReactJs/MyApplication/Dashboard.jsx`, and `resources/views/embedded.blade.php` were copied locally before implementation. The original patch is saved at `/tmp/vidial-server-working-changes.patch` on the development machine. No server files, environment values, tokens, migrations or cron jobs were changed during this work.

Server: `ssh afterparty`, `/home/master/applications/udaygdjvbb/public_html`, branch `ga_v2`; CLI PHP 8.2.35.

## Changes

- Laravel 9 to 12.70.2; Shopify package 22 to 27.3.0. PHP requirement is now 8.2+.
- Sanctum 4, Hasin 5, Dropbox 3.0.8, Inertia server 1.x (matching frontend 1.x), PHPUnit 11 and compatible development tools. Stable dependency resolution and committed Composer lockfile.
- Existing application bootstrap, HTTP kernel, providers and routing structure retained.
- Offline-token opt-in configuration, automatic legacy conversion option and daily refresh-token renewal command. API calls refresh access tokens through the package.
- The Mantle job now refreshes Shopify credentials before direct HTTP requests. Both access and refresh tokens are hidden from serialized users.
- Published Shopify views use the supported `isMPAApplication()` check and permit guest rendering.
- Session duration is an integer for Carbon 3; order email/reminder interval model attributes are cast to integers. Theme cache duration was already an integer on deployed ga_v2.
- Runtime environment reads in application code and mail views moved to configuration, including Mantle, Mailgun, Dropbox and app URLs. This prevents null settings after `config:cache`. Dropbox authorization-code fallback removed; configure `AUTHORIZATION_CODE` if that helper is used.
- Frontend lockfile repaired with missing optional platform entries; frontend package constraints unchanged.
- PHPUnit uses a forced isolated in-memory SQLite database and synthetic encryption key. It does not run against the application database.

## Validation

- PHP 8.3.28 locally: all 131 application/config/route PHP files linted.
- 10 Shopify regression tests pass, 32 assertions: OAuth exchange/refresh payloads, encrypted token rotation, failed refresh preservation, legacy behavior, refreshed direct HTTP token use, Mantle job, guest/SPA/MPA layouts and string-valued email scheduling intervals.
- Composer validate, production platform requirements, package discovery, route cache, config cache, Blade view cache and schedule listing pass.
- `npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund` repaired the incomplete lockfile; `npm ci --legacy-peer-deps --ignore-scripts --no-audit --no-fund` and `npm run build` pass.
- Full suite: 34 tests, 59 assertions, 2 errors and 19 failures. Remaining failures are the older scaffold auth/profile tests expecting routes and behavior not registered by Vidial (including `verification.verify`, profile and registration). They were retained; a green full suite is not claimed.
- No real Shopify OAuth/refresh exchange, production database migration, webhook delivery or email delivery was performed. Embedded Shopify login, Mantle identification, recurring jobs, Dropbox/Mailgun and merchant workflows require staging smoke tests before production release.

## Upgrade-guide review

Reviewed Laravel 10, 11 and 12 upgrade guides for the 9-to-12 jump. Dependency constraints, Sanctum middleware, Carbon numeric values and existing structure were addressed. No custom DatabaseTokenRepository constructor, UserProvider implementation, custom Monolog handler, model `$dates` property, casts relationship, Doctrine schema introspection, or floating-point/change-column migrations were found in the application audit. Existing migrations were not rewritten or broadly executed.

Sources:
- https://laravel.com/docs/10.x/upgrade
- https://laravel.com/docs/11.x/upgrade
- https://laravel.com/docs/12.x/upgrade
- https://packagist.org/packages/kyon147/laravel-shopify
- https://shopify.dev/docs/apps/build/authentication-authorization/migrate-to-expiring-offline-access-tokens

## Deployment

Do not pull master on this server: deployed code is ga_v2. Review and commit the upgrade branch, including the preserved server edits. Before deployment, back up the database, `.env` and the server patch outside the public directory. Preserve `APP_KEY` because refresh tokens are encrypted. Ensure PHP-FPM and CLI both satisfy Composer platform requirements. PHPUnit 11 needs PHP 8.3 for development/tests; production `composer install --no-dev` is compatible with PHP 8.2.

Prefer a release directory and switch only after install/build checks. If deploying in place, enter maintenance mode before replacing dependencies. Preserve server edits before switching branches; do not reset them blindly.

```bash
cd /home/master/applications/udaygdjvbb/public_html
php artisan down
# Deploy the reviewed upgrade branch/commit after preserving existing server edits.
composer install --no-dev --optimize-autoloader
php artisan optimize:clear
npm ci --legacy-peer-deps
npm run build
php artisan migrate --path=vendor/kyon147/laravel-shopify/src/resources/database/migrations/2026_04_02_120000_add_expiring_offline_token_columns_to_shops_table.php --force
```

Run only this migration if older migration history is not reliable. Verify these columns do not already exist first: `shopify_offline_refresh_token` (text), `shopify_offline_access_token_expires_at` (timestamp), `shopify_offline_refresh_token_expires_at` (timestamp). All are nullable on the configured shops table, normally users.

After the migration succeeds, add to server `.env`:

```dotenv
SHOPIFY_EXPIRING_OFFLINE_TOKENS=true
SHOPIFY_AUTO_MIGRATE_LEGACY=true
SHOPIFY_REFRESH_OFFLINE_TOKEN_BEFORE_API_CALL=true
SHOPIFY_OFFLINE_ACCESS_TOKEN_REFRESH_SKEW=60
SHOPIFY_OFFLINE_REFRESH_TOKEN_RENEWAL_DAYS=14
```

Existing merchants convert on their next eligible package API access. New installations request expiring offline tokens. Conversion revokes the previous permanent token; external consumers that retain it must be updated. An already expired/revoked refresh token requires reauthorization; a scheduler cannot revive it.

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
php artisan schedule:list
php artisan up
```

Keep queue workers supervised. The renewal command queues work and requires running workers when an asynchronous queue is configured. Ensure a cache store supporting locks; multiple nodes must share the lock store.

Scheduler (check existing Cloudways jobs before adding to avoid duplication):

```cron
* * * * * cd /home/master/applications/udaygdjvbb/public_html && php artisan schedule:run >> /dev/null 2>&1
```

The command runs daily and renews refresh tokens within the configured 14-day window. The app also refreshes expiring access tokens before API calls. No matching udaygdjvbb line was found in the inspected SSH user's crontab; Cloudways-managed jobs should be checked separately.
