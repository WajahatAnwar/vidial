<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout</title>
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body>
    <div class="container">
        <div>
            <img src="{{ asset('assets/arrow.svg') }}" alt="arrow">
            <a href="{{ $return_url }}" class="return-link"> Return to store</a>
        </div>
        <h1>Checkout</h1>
        <div class="checkout">
            <div class="summary">
                <div class="price">
                    <p>Subtotal</p>
                    <p>${{ $cart['items_subtotal_price'] / 100 }}</p>
                </div>
                <hr />
                <div class="price">
                    <p>Total</p>
                    <p>${{ $cart['total_price'] / 100 }}</p>
                </div>
                <hr />
                <div class="contact">
                    <p>Contact</p>
                    <input type="email" placeholder="email@example.com" value="{{ $customer->email }}" disabled>
                </div>
                <form method="POST">
                    <button type="submit" class="transfer-button">Transfer Order</button>
                </form>
            </div>
            <hr class="hr-vertical" />
            <div class="order-summary">

                <p class="order-summary-text">Order Summary</p>
                @foreach ($cart_items as $item)
                    <div class="item">
                        <div class="image-count-wrapper">
                            <div class="count">{{ $item['quantity'] }}</div>
                            <span>
                                <img src="{{ $item['image'] }}" alt="Shirt">
                            </span>
                        </div>
                        <p class="checkout-txt-wrapper">{{ $item['title'] }}</p>
                        <p>${{ $item['price'] / 100 }}</p>
                    </div>
                @endforeach
                <!-- Repeat the above block for other items -->
            </div>
        </div>
    </div>
</body>

</html>
