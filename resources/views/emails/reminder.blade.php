<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder Email</title>
</head>
<body>
    {{-- <img src="vidialLogoPower.png" style="display: block;margin: 20px auto;max-width: 300px;"> --}}
     {!! $body['body'] !!}
    <div style="margin-top: 50px;"></div>
    <a href="{{$body['url']}}" style="font-size: 18px;background:{{$body['btn_color']}};color: #fff;border: none;border-radius: 4px;display: block;margin: 50px auto;padding: 12px 40px;cursor: pointer;">{{$body['btn_text']}}</a>
</body>
</html>
