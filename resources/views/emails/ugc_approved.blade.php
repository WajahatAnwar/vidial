<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UGC Approved</title>
</head>

<body style="margin: 0;padding: 0;">

        <div style="background:#fff;text-align:center;padding: 20px; border-radius: 15px;display:flex;margin: auto;">
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

</body>

</html>
