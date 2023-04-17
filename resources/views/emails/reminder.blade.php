<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder</title>
</head>

<body style="margin: 0;padding: 0;">
    <div style="width: 100%; padding: 20px;background: #EBEBEB;display: flex;justify-content: center;">
        <div style="max-width: 600px;background: #fff;padding: 20px;border-radius: 15px;display: block;margin: auto;">
            <div>
                @php
                    $logo = $body['logo'] == '' ? url('public/images/landing_footer.png') : $body['logo'];
                @endphp
                <img src="{{ $logo }}" style="display: block;margin: 20px auto;max-width: 250px;">
                {!! $body['body'] !!}
            </div>
        </div>
    </div>



</body>

</html>
