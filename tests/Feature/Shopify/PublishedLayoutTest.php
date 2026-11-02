<?php

namespace Tests\Feature\Shopify;

use Tests\TestCase;

class PublishedLayoutTest extends TestCase
{
    public function test_published_layout_renders_for_spa_without_token_polling(): void
    {
        config(['shopify-app.frontend_type' => 'SPA']);
        $html = view('shopify-app::layouts.default', ['shopDomain' => 'test.myshopify.com'])->render();
        $this->assertStringContainsString('shopifycloud/app-bridge.js', $html);
        $this->assertStringNotContainsString('function keepRetrievingToken()', $html);
    }

    public function test_layout_renders_for_a_guest_without_a_shop_parameter(): void
    {
        config(['shopify-app.frontend_type' => 'SPA']);
        $html = view('shopify-app::layouts.default')->render();
        $this->assertStringContainsString('shopify-api-key', $html);
    }

    public function test_published_layout_renders_for_mpa_with_token_polling(): void
    {
        config(['shopify-app.frontend_type' => 'MPA']);
        $html = view('shopify-app::layouts.default', ['shopDomain' => 'test.myshopify.com'])->render();
        $this->assertStringContainsString('function keepRetrievingToken()', $html);
    }
}
