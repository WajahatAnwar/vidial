<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UGC Declined</title>
</head>

<body style="margin: 0;padding: 0;">
    <div style="width: 100%; padding: 20px;background: #ffffff;display: flex;justify-content: center;">
        <div style="max-width: 600px;background: #fff;padding: 20px;border-radius: 15px;display: block;margin: auto;">
            <div>
                @php
                    $logo = $body['logo'];
                @endphp
                @if($logo)
                <img src="{{ $logo }}" style="display: block;margin: 20px auto;max-width: 150px;">
                @endif
                {!! $body['body'] !!}
            </div>
        </div>
    </div>



</body>

</html>
