@component('mail::message')

<?php

    $str = "Shop: $shop_name\n Purchase Order ID: $order_data->purchase_order_id\n Order No: $order_data->order_no\n Email: $order_data->email\n Phone: $order_data->phone\n Country: $order_data->country\n Total Price: $order_data->total_price\n Biling Address: $order_data->billing_address\n Shipping Address: $order_data->shipping_address";
    $str = str_replace("[order_details]",$str,$value->body);

?>

<p style="font-size: 12px !important; font-weight:400 !important; font-family: sans-serif !important">
    <?php echo nl2br($str) ?>
</p>


{{-- <h3>{{$value->subject}}</h3> --}}

{{-- <p>{{$value->body}}</p> --}}

{{-- <p>{{$order_data->order_no}}</p> --}}

{{-- @component('mail::button', ['url' => ''])
Button Text
@endcomponent --}}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
