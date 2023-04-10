<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Post Purchase Email</title>
  </head>
  <body>
     <p>
        {{$body['body']}}
     </p>

     <button style="backgroud:{{$body['btn_color']}};" >{{$body['btn_text']}}</button>
  </body>
</html>