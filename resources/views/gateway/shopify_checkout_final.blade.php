<!DOCTYPE html>
<html lang="en" dir="ltr"
    class="no-js mac chrome desktop page--no-banner page--logo-main page--show page--show card-fields">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, height=device-height, minimum-scale=1.0, user-scalable=0">
    <meta name="referrer" content="origin">

    <title>Checkout - Client Name</title>

    <meta
        data-body-font-family="-apple-system, blinkmacsystemfont, 'segoe ui', roboto, helvetica, arial, sans-serif, 'apple color emoji', 'segoe ui emoji', 'segoe ui symbol'"
        data-body-font-type="system">
    <meta property="og:image" content="https://procurement.clubhub.host/static/apps/shopify/img/no-image.gif" />

    <!--[if lt ie 9]>
    <link rel="stylesheet" media="all" href="/static/apps/shopify/css/oldie.min.css" />
    <![endif]-->

    <!--[if gte ie 9]><!-->
    <link rel="stylesheet" media="all" href="{{ asset('assets/checkout.min.css') }}" />
    <!--<![endif]-->

    <script src="{{ asset('assets/checkout_countries.min.js') }}" crossorigin="anonymous"></script>
    <script src="{{ asset('assets/checkout.min.js') }}" crossorigin="anonymous"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <style>
        .select-box {
            -webkit-appearance: menulist-button;
            -moz-appearance: menulist-button;
            appearance: menulist-button;
            border: 1px solid #d9d9d9;
            width: 100px !important;
        }
    </style>
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}?v={{ filemtime('assets/styles.css') }}">
</head>

<body>
    <a href="#main-header" class="skip-to-content">
        Skip to content
    </a>

    <header class="banner" data-header role="banner">
        <div class="wrap">
            <span class="logo logo--left"><span class="logo__text heading-1">Checkout</span></span>
            <h1 class="visually-hidden">Shipping</h1>
        </div>
    </header>

    <aside role="complementary">
        <button class="order-summary-toggle order-summary-toggle--show shown-if-js" aria-expanded="false"
            aria-controls="order-summary" data-drawer-toggle="[data-order-summary]">
            <span class="wrap">
                <span class="order-summary-toggle__inner">
                    <span class="order-summary-toggle__icon-wrapper">
                        <svg width="20" height="19" xmlns="http://www.w3.org/2000/svg"
                            class="order-summary-toggle__icon">
                            <path
                                d="M17.178 13.088H5.453c-.454 0-.91-.364-.91-.818L3.727 1.818H0V0h4.544c.455 0 .91.364.91.818l.09 1.272h13.45c.274 0 .547.09.73.364.18.182.27.454.18.727l-1.817 9.18c-.09.455-.455.728-.91.728zM6.27 11.27h10.09l1.454-7.362H5.634l.637 7.362zm.092 7.715c1.004 0 1.818-.813 1.818-1.817s-.814-1.818-1.818-1.818-1.818.814-1.818 1.818.814 1.817 1.818 1.817zm9.18 0c1.004 0 1.817-.813 1.817-1.817s-.814-1.818-1.818-1.818-1.818.814-1.818 1.818.814 1.817 1.818 1.817z" />
                        </svg>
                    </span>
                    <span class="order-summary-toggle__text order-summary-toggle__text--show">
                        <span>Show order summary</span>
                        <svg width="11" height="16" xmlns="http://www.w3.org/2000/svg"
                            class="order-summary-toggle__dropdown" fill="#000">
                            <path
                                d="M.504 1.813l4.358 3.845.496.438.496-.438 4.642-4.096L9.504.438 4.862 4.534h.992L1.496.69.504 1.812z" />
                        </svg>
                    </span>
                    <span class="order-summary-toggle__text order-summary-toggle__text--hide">
                        <span>Hide order summary</span>
                        <svg width="11" height="7" xmlns="http://www.w3.org/2000/svg"
                            class="order-summary-toggle__dropdown" fill="#000">
                            <path
                                d="M6.138.876L5.642.438l-.496.438L.504 4.972l.992 1.124L6.138 2l-.496.436 3.862 3.408.992-1.122L6.138.876z" />
                        </svg>
                    </span>
                    <dl class="order-summary-toggle__total-recap total-recap"
                        data-order-summary-section="toggle-total-recap">
                        <dt class="visually-hidden"><span>Sale price</span></dt>
                        <dd>
                            <span
                                class="order-summary__emphasis total-recap__final-price skeleton-while-loading">{{ $calculation->getTotal() }}</span>
                        </dd>
                    </dl>
        </button>
    </aside>

    <div class="content" data-content>
        <div class="wrap">
            <div class="main">
                <header class="main__header" role="banner">
                    <span class="logo logo--left"><span class="logo__text heading-1">Checkout</span></span>
                    <h1 class="visually-hidden">Shipping</h1>
                    <nav aria-label="Breadcrumb">
                        <ol class="breadcrumb " role="list">
                            <li class="breadcrumb__item breadcrumb__item--completed">
                                <a class="breadcrumb__link" href="{{ $return_url }}">
                                    Return to Store</a>
                            </li>
                        </ol>
                    </nav>
                    <div class="shown-if-js" data-alternative-payments></div>
                </header>
                <main class="main__content" role="main">
                    <div class="step" data-step="shipping_method" data-last-step="false">
                        <form class="edit_checkout" data-shipping-method-form="true" data-ignore-floating-label="true"
                            action="" accept-charset="UTF-8" method="post">
                            @csrf
                            @if (isset($discount_code))
                                <input type="hidden" name="discount_code" value="{{ $discount_code->label }}">
                            @endif
                            <div class="step__sections">
                                <div class="section">
                                    <div class="content-box">
                                        <div role="table"
                                            class="content-box__row content-box__row--tight-spacing-vertical">
                                            <div role="row" class="review-block">
                                                <div class="review-block__inner">
                                                    <div role="rowheader" class="review-block__label">
                                                        Contact
                                                    </div>
                                                    <div role="cell" class="review-block__content">
                                                        <bdo dir="ltr">{{ $customer->email }}</bdo>
                                                    </div>
                                                </div>
                                            </div>
                                            @if (!$client->shouldCalculateShippingAndTaxesOnIncomingOrder() && !empty($shipping_address->line1))
                                                <div role="row" class="review-block">
                                                    <div class="review-block__inner">
                                                        <div role="rowheader" class="review-block__label">
                                                            Ship to
                                                        </div>
                                                        <div role="cell" class="review-block__content">
                                                            <address class="address address--tight">
                                                                {{ $shipping_address->label }},
                                                                {{ $shipping_address->line1 }},
                                                                {{ $shipping_address->city }}
                                                                {{ $shipping_address->state }}
                                                                {{ $shipping_address->zip }},
                                                                {{ $shipping_address->country }}
                                                            </address>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                                @if (!empty($rates))
                                    <div class="section section--shipping-method">
                                        <div class="section__header">
                                            <h2 class="section__title" id="main-header" tabindex="-1">
                                                Shipping method
                                            </h2>
                                        </div>
                                        <script type="text/javascript">
                                            var grand_total = {{ $calculation->getTotal() }};

                                            function updateTotal(shipping_total) {
                                                $('#shipping_text').html(shipping_total);
                                                $('#total_text').html(grand_total + shipping_total);
                                            }
                                        </script>
                                        <div class="section__content">
                                            <fieldset class="content-box" data-shipping-methods="">
                                                <legend class="visually-hidden">Choose a shipping method</legend>
                                                @foreach ($rates as $rate)
                                                    <div class="content-box__row">
                                                        <div class="radio-wrapper"
                                                            data-shipping-method="shopify-Economy-4.90">
                                                            <div class="radio__input">
                                                                <input class="input-radio"
                                                                    onchange="updateTotal({{ $rate['price']['amount'] }})"
                                                                    type="radio" value="{{ $rate['handle'] }}"
                                                                    name="shipping_rate[]"
                                                                    id="checkout_shipping_rate_id_{{ $rate['title'] }}">
                                                            </div>
                                                            <label class="radio__label"
                                                                for="checkout_shipping_rate_id_{{ $rate['title'] }}">
                                                                <span class="radio__label__primary"
                                                                    data-shipping-method-label-title="Economy">{{ $rate['title'] }}<br>
                                                                </span>
                                                                <span class="radio__label__accessory">
                                                                    <span class="content-box__emphasis">
                                                                        {{ $rate['price']['amount'] }}
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                @endforeach
                                                @if ($client->shouldEnableCustomShippingProvider())
                                                    <div class="content-box__row">
                                                        <div class="radio-wrapper"
                                                            data-shipping-method="shopify-CustomAccountNumber-0.00">
                                                            <div class="radio__input">
                                                                <input class="input-radio" onchange="updateTotal(0.0)"
                                                                    type="radio" value="custom_account_number"
                                                                    name="shipping_rate[]"
                                                                    id="checkout_shipping_rate_id_custom_account_number">
                                                            </div>
                                                            <label class="radio__label"
                                                                for="checkout_shipping_rate_id_custom_account_number">
                                                                <span class="radio__label__primary"
                                                                    data-shipping-method-label-title="CustomAccountNumber">Custom
                                                                    Shipper: <select name="shipper_name"
                                                                        class="select-box">
                                                                        <option value="UPS">UPS</option>
                                                                        <option value="Fedex">Fedex</option>
                                                                    </select> Account #: <input type="text"
                                                                        name="account_number"
                                                                        style="width: 100px !important; border: 1px solid #d9d9d9"><br>
                                                                </span>
                                                                <span class="radio__label__accessory">
                                                                    <span class="content-box__emphasis">
                                                                        TBD
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                @endif
                                            </fieldset>
                                        </div>
                                    </div>
                                @endif
                            </div>
                            @if(isset($message))
                                <p style="color: red;">{{ html_entity_decode($message) }}</p>
                            @endif
                            <div class="step__footer" data-step-footer>
                                <input type="submit" value="Transfer Order" id="continue_button"
                                    class="step__footer__continue-btn btn @if (!$can_checkout) btn--disabled @endif transfer-button"
                                    aria-busy="false" @if (!$can_checkout) disabled="disabled" @endif>
                            </div>
                        </form>
                    </div>
                </main>
                <footer class="main__footer" role="contentinfo">
                    <p class="copyright-text ">
                        All rights reserved Club Colors Buyer LLC
                    </p>
                </footer>
            </div>
            <aside class="sidebar" role="complementary">
                <div class="sidebar__header">
                    <span class="logo logo--left"><span class="logo__text heading-1">Test Quantum
                            Punchout</span></span>
                    <h1 class="visually-hidden">Shipping</h1>
                </div>
                <div class="sidebar__content">
                    <div id="order-summary" class="order-summary order-summary--is-collapsed" data-order-summary>
                        <h2 class="visually-hidden-if-js mb-15">Order summary</h2>


                        <!-- Order -- Umair Start -->
                        <!-- <div class="order-summary">


                            <div class="item">
                                <div class="image-count-wrapper">
                                    <div class="count">1</div>
                                    <img src="shirt.png" alt="Shirt">
                                </div>
                                <p>Port Authority © Long Sleeve Performance Staff Shirt</p>
                                <p>$38.49</p>
                            </div>
                            <div class="item">
                                <div class="image-count-wrapper">
                                    <div class="count">1</div>
                                    <img src="shirt.png" alt="Shirt">
                                </div>
                                <p>Port Authority © Long Sleeve Performance Staff Shirt</p>
                                <p>$38.49</p>
                            </div>

                        </div> -->
                        <!-- Order -- Umair End -->



                        <div class="order-summary__sections">
                            <div class="order-summary__section order-summary__section--product-list">
                                <div class="order-summary__section__content">
                                    <!-- <div
                                        style="background-color: #f8d7da; color: #721c24; width: 100%;  border-color: #f5c6cb;     position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem;  border-radius: .25rem;">
                                        Checkout Error Message</div> -->
                                    <table class="product-table">
                                        <caption class="visually-hidden">Shopping cart</caption>
                                        <thead class="product-table__header">
                                            <tr>
                                                <th scope="col"><span class="visually-hidden">Product image</span>
                                                </th>
                                                <th scope="col"><span class="visually-hidden">Description</span>
                                                </th>
                                                <th scope="col"><span class="visually-hidden">Quantity</span></th>
                                                <th scope="col"><span class="visually-hidden">Price</span></th>
                                            </tr>
                                        </thead>
                                        <tbody data-order-summary-section="line-items">
                                            @foreach ($cart_items as $item)
                                                <tr class="product" data-product-id="6598299320507"
                                                    data-variant-id="39536749838523" data-product-type=""
                                                    data-customer-ready-visible>
                                                    <td class="product__image">
                                                        <div class="product-thumbnail ">
                                                            <div class="product-thumbnail__wrapper">
                                                                <img alt="test" class="product-thumbnail__image"
                                                                    src="{{ $item['image'] }}" />
                                                            </div>
                                                            <span class="product-thumbnail__quantity"
                                                                aria-hidden="true">{{ $item['quantity'] }}</span>
                                                        </div>
                                                    </td>
                                                    <th class="product__description" scope="row">
                                                        <span
                                                            class="product__description__name order-summary__emphasis">{{ $item['title'] }}</span>
                                                        <span
                                                            class="product__description__variant order-summary__small-text"></span>
                                                    </th>
                                                    <td class="product__quantity">
                                                        <span class="visually-hidden">1</span>
                                                    </td>
                                                    <td class="product__price">
                                                        <span class="order-summary__emphasis skeleton-while-loading">
                                                            @if (isset($discount_code) && $discount_code->isPercentage())
                                                                {{ $item['price'] / 100 - $discount_code->getDiscountForTotal($item['price'] / 100) }}
                                                                (${{ $item['price'] / 100 }} -
                                                                {{ $discount_code->getFormattedValue() }})
                                                            @else
                                                                {{ $item['price'] / 100 }}
                                                            @endif


                                                        </span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                    <div class="order-summary__scroll-indicator" aria-hidden="true" tabindex="-1">
                                        Scroll for more items
                                        <svg aria-hidden="true" focusable="false" class="icon-svg icon-svg--size-12">
                                            <use xlink:href="#down-arrow" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            @if ($client->areDiscountCodesEnabled())
                                <div class="order-summary__section order-summary__section--discount">
                                    <h3 class="visually-hidden">Gift card or discount code</h3>
                                    <form action="" accept-charset="UTF-8" method="post"
                                        id="validate_discount_form">
                                        @csrf
                                        <input type="hidden" name="validate_discount_code" value="1"
                                            autocomplete="off" />
                                        <div class="fieldset">
                                            <div class="field ">
                                                <label class="field__label" for="checkout_reduction_code">Gift card or
                                                    discount code</label>
                                                <div class="field__input-btn-wrapper">
                                                    <div class="field__input-wrapper">
                                                        <input placeholder="Gift card or discount code"
                                                            class="field__input" id="checkout_reduction_code"
                                                            data-discount-field="true" autocomplete="off"
                                                            aria-required="true" size="30" type="text"
                                                            name="discount_code"
                                                            value="@if (isset($discount_code)) {{ $discount_code->label }} @endif" />
                                                    </div>
                                                    <input type="submit" class="field__input-btn btn transfer-button"
                                                        value="Apply">
                                                </div>
                                                @if(isset($discount_message))
                                                    <p style="color: red;">{{ html_entity_decode($discount_message) }}</p>
                                                @endif
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            @endif
                            <div class="order-summary__section order-summary__section--total-lines"
                                data-order-summary-section="payment-lines">
                                <table class="total-line-table">
                                    <caption class="visually-hidden">Cost summary</caption>
                                    <thead>
                                        <tr>
                                            <th scope="col"><span class="visually-hidden">Description</span></th>
                                            <th scope="col"><span class="visually-hidden">Price</span></th>
                                        </tr>
                                    </thead>
                                    <tbody class="total-line-table__tbody">
                                        <tr class="total-line total-line--subtotal">
                                            <th class="total-line__name" scope="row">Subtotal</th>
                                            <td class="total-line__price">
                                                <span class="order-summary__emphasis skeleton-while-loading"
                                                    data-checkout-subtotal-price-target="1000">
                                                    ${{ $calculation->getSubtotal() }}
                                                </span>
                                            </td>
                                        </tr>
                                        @if (!empty($rates))
                                            <tr class="total-line total-line--shipping">
                                                <th class="total-line__name" scope="row">
                                                    <span>Shipping</span>
                                                </th>
                                                <td class="total-line__price">
                                                    <span class="skeleton-while-loading order-summary__small-text"
                                                        data-checkout-total-shipping-target="0" id="shipping_text">
                                                        @if (!empty($rates) && isset($rates[0]))
                                                            ${{ $rates[0]['price']['amount'] }}
                                                        @else
                                                            0
                                                        @endif
                                                    </span>
                                                </td>
                                            </tr>
                                        @endif
                                        @if ($calculation->getTaxTotal() > 0)
                                            <tr class="total-line total-line--taxes " data-checkout-taxes>
                                                <th class="total-line__name" scope="row">Taxes</th>
                                                <td class="total-line__price">
                                                    <span class="order-summary__emphasis skeleton-while-loading"
                                                        data-checkout-total-taxes-target="101">{{ $calculation->getTaxTotal() }}</span>
                                                </td>
                                            </tr>
                                        @endif
                                        @if (isset($discount_code))
                                            <tr class="total-line total-line--taxes " data-checkout-taxes>
                                                <th class="total-line__name" scope="row">
                                                    @if ($discount_code->isGiftCard())
                                                        Gift Card Balance
                                                    @else
                                                        Discount Code
                                                    @endif
                                                </th>
                                                <td class="total-line__price">
                                                    <span class="order-summary__emphasis skeleton-while-loading"
                                                        data-checkout-total-taxes-target="101">-{{ $discount_code->getFormattedValue() }}</span>
                                                </td>
                                            </tr>
                                        @endif
                                    </tbody>
                                    <tfoot class="total-line-table__footer">
                                        <tr class="total-line">
                                            <th class="total-line__name payment-due-label" scope="row">
                                                <span class="payment-due-label__total">Total</span>
                                            </th>
                                            <td class="total-line__price payment-due" data-presentment-currency="USD">
                                                <span class="payment-due__currency remove-while-loading">USD</span>
                                                <span class="payment-due__price skeleton-while-loading--lg"
                                                    data-checkout-payment-due-target="1101" id="total_text">
                                                    @if (!empty($rates) && isset($rates[0]))
                                                        {{ $rates[0]['price']['amount'] + $calculation->getTotal() }}
                                                    @else
                                                        {{ $calculation->getTotal() }}
                                                    @endif
                                                </span>
                                            </td>
                                        </tr>

                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="visually-hidden" data-order-summary-section="accessibility-live-region">
                        <div aria-live="polite" aria-atomic="true" role="status">
                            Updated total price:
                            <span>
                                {{ $calculation->getTotal() }}
                            </span>
                        </div>
                    </div>
                    <div id="partial-icon-symbols" class="icon-symbols" data-tg-refresh="partial-icon-symbols"
                        data-tg-refresh-always="true"><svg xmlns="http://www.w3.org/2000/svg">
                            <symbol id="spinner-small"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path
                                        d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0v2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14h2z" />
                                </svg></symbol>
                            <symbol id="spinner-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path
                                        d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0v2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8h2z" />
                                </svg></symbol>
                            <symbol id="chevron-right"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
                                    <path d="M2 1l1-1 4 4 1 1-1 1-4 4-1-1 4-4" />
                                </svg></symbol>
                            <symbol id="down-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
                                    <path
                                        d="M10.817 7.624l-4.375 4.2c-.245.235-.64.235-.884 0l-4.375-4.2c-.244-.234-.244-.614 0-.848.245-.235.64-.235.884 0L5.375 9.95V.6c0-.332.28-.6.625-.6s.625.268.625.6v9.35l3.308-3.174c.122-.117.282-.176.442-.176.16 0 .32.06.442.176.244.234.244.614 0 .848" />
                                </svg></symbol>
                        </svg>
                    </div>


                </div>
            </aside>
        </div>
    </div>
</body>

</html>
