<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    {{-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/brands.min.css" integrity="sha512-LsMmtHht2t5phORf0xXFdTC0rSlML1XcraLTrABli/0MMMylsJi3XA23ReVQkZ7jLkOEIMicWGItyK4CAt2Xw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous"> --}}
  </head>
  <body>
    <div class="row justify-content-center " style="margin-top: 40px;text-align: center;">
        <div style="width: 450px !important;margin: auto !IMPORTANT;">
            <img style="display: block;margin: auto;" src="{{ config('app.url')}}/images/image 112.png" >
            <h3 class="text-center mt-4 mb-3" style="font-size: 30px;font-weight: 600;text-align: center;margin-top: 30px;color:#111827">Sorry! <br>Your video got rejected.</h3>


            <h5 class=" mb-3 mt-4" style="text-align: center;font-size: 20px;color: #111827;font-weight: 700;margin-bottom: 0px;">Reason for being rejected:</h5>
              <h5 class=" mb-3 mt-4" style="text-align: center;font-size: 20px;color: #7D7D7D;font-weight: normal;margin-bottom: 20px;margin-top: 0;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </h5>
              <h5 class=" mb-3 mt-4" style="text-align: center;font-size: 20px;color: #111827;font-weight: normal;margin-bottom: 0px;">We are excited to see your video again. You can share the video again after making the mentioned improvements. </h5>
              <div style="display: flex;justify-content: center;" >
                 <h5 style="font-size: 18px;color: #000;">Powered by </h5>
                    <div>
                        <img src="{{ config('app.url')}}/images/vidialLogo.png" style="margin: 35px 2 px 0px 10px;">
                    </div>
                 <h5 style="font-size: 18px;color: #000;">idial</h5>
              </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGCnuZBEYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
  </body>
</html>
