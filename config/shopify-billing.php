<?php

/*
| Manual Shopify billing catalog for Vidial / GoodAuthentic.
|
| Names match the plans already stored in the database:
| Free, Standard, Premium, Enterprise.
|
| There are no Partner Dashboard plan IDs in this app. With Partner Dashboard
| pricing set to manual (app-managed, not Managed pricing), osiset/shopify-app
| creates the charge from the plans row and Shopify returns a confirmation URL.
|
| Price and ugc_* values below are used only when PlanSeeder inserts a missing
| name. They copy the current catalog in `plans (2).sql` (the Free / Standard /
| Premium / Enterprise rows). Existing rows keep their price and quotas.
|
| Do not point SHOPIFY_BILLING_ENABLED at Cloudways until Sanwal confirms a
| staging host. Leave Mantle env vars untouched until then.
*/

return [

    'test_charges' => (bool) env('SHOPIFY_BILLING_TEST', true),

    'plans' => [
        'Free' => [
            'price' => 0,
            'capped_amount' => 1,
            'ugc_video_count' => 1,
            'ugc_email_count' => 600000,
            'description' => 'Select this plan to keep your Landing Page and Approved Videos and come back later.',
        ],
        'Standard' => [
            'price' => 49,
            'capped_amount' => 0,
            'ugc_video_count' => 500000,
            'ugc_email_count' => 600000,
            'description' => 'Send emails from GoodAuthentic',
        ],
        'Premium' => [
            'price' => 199,
            'capped_amount' => 0,
            'ugc_video_count' => 500000,
            'ugc_email_count' => 600000,
            'description' => 'For brands that need premium intergratios',
        ],
        'Enterprise' => [
            'price' => 499,
            'capped_amount' => 0,
            'ugc_video_count' => 500000,
            'ugc_email_count' => 600000,
            'description' => 'For brands that need premium intergrations & services',
        ],
    ],

];
