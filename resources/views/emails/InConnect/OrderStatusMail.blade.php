<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Order Update Mail</title>
</head>

<body>

    <table width="600" border="0">
        <tbody>
            <tr>
                <td>

                    <table width="600" border="0">
                        <tbody>
                            <tr style="text-align: center; width: 100%">
                                <td colspan="4" style="text-align: left; width: 100%">
                                    <img src="https://tscstatic.clubcolors.com/logo/logo_Z0WUONL9NY.png"
                                        style="width: 150px;text-align: left; display: block;" />
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <h3
                                        style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-size: 28px;">
                                        {{ $data['subject'] }}</h3>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <br>
                                    <b
                                        style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-size: 14px">Order
                                        ID {{ $data['order_number'] }}</b>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <br>
                                    <p
                                        style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';font-size: 18px">
                                        Dear {{ $data['customer_name'] }},</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <p
                                        style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; line-height: 1.5em; font-size: 18px">
                                        {{ $data['body'] }}</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <p
                                        style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #333333; font-size: 18px;">
                                        Delivery Address</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <div
                                        style="background: #f8f8f8; padding: 20px; width: auto; margin: 10px; border:1px solid #f1f1f1">
                                        <strong
                                            style=" font-size: 18px;font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">{{ $data['customer_name'] }}</strong>
                                        <p
                                            style="margin: 0px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                            {{ $data['shipping_address'] }}</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="">
                    <table width="600" border="0">
                        <tbody>
                            <tr>
                                <td colspan="4"
                                    style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #333333; font-size: 18px;">
                                    Order Details</td>
                            </tr>
                            <tr>
                                <td><br></td>
                            </tr>

                            <tr>
                                <td style="min-width: 90px;">
                                    <p
                                        style="text-transform: capitalize; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';font-weight: bold;">
                                        PRODUCT NAME</p>
                                </td>
                                <td style="min-width: 90px;">
                                    <p
                                        style="text-transform: capitalize; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';font-weight: bold;">
                                        RATE</p>
                                </td>
                                <td style="min-width: 90px;">
                                    <p
                                        style="text-transform: capitalize; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';font-weight: bold;">
                                        QTY</p>
                                </td>
                                <td style="min-width: 140px;">
                                    <p
                                        style="text-transform: capitalize; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';font-weight: bold;">
                                        SUBTOTAL</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <hr>
                                </td>
                            </tr>
                            @foreach ($data['line_items'] as $item)
                                <tr>
                                    <td>
                                        <p
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                            {{ $item['name'] }}</p>
                                    </td>
                                    <td>
                                        <p
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                            ${{ $item['price'] }}</p>
                                    </td>
                                    <td>
                                        <p
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                            {{ $item['quantity'] }}
                                        </p>
                                    </td>
                                    <td>
                                        <p
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                            ${{ $item['price'] * $item['quantity'] }}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4">
                                        <hr>
                                    </td>
                                </tr>
                            @endforeach

                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <p style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                        Grand Total</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXVkH26ZsF43LGq6BupCE_xn25o4N0Cs1EOIASa6HriM43kzGDtWIknVZAs5B7JzaJRZ4&usqp=CAU"
                                        style="width: 80px; background: #ffffff" /></td>
                                <td></td>
                                <td></td>
                                <td><b
                                        style="font-size: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-size: 26px">${{ $data['subtotal_price'] }}</b><br>
                                    {{-- <p
                                        style="color: red;font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'">
                                        10% Tax Included</p> --}}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
