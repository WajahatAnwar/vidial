<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Purchase Email</title>
</head>
<body>
    @php
     $logo = $body['logo']=='' ? url('public/images/landing_footer.png') : $body['logo']  
    @endphp
    <img src="{{$logo}}" style="display: block;margin: 20px auto;max-width: 300px;">
     {!! $body['body'] !!}
    <div style="margin-top: 50px;"></div>

</body>
</html>
