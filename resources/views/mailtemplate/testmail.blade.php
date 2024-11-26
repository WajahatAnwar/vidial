<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    {{-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/brands.min.css" integrity="sha512-L+sMmtHht2t5phORf0xXFdTC0rSlML1XcraLTrABli/0MMMylsJi3XA23ReVQkZ7jLkOEIMicWGItyK4CAt2Xw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous"> --}}
  </head>
  <body>
    <div class="row justify-content-center " style="margin-top: 40px;text-align: center;">
        <div style="width: 450px !important;margin: auto !IMPORTANT;">
            @include('landingPage.logo',['current_user_id'=>$details['user_id']])
            <h3 class="text-center mt-4 mb-3" style="font-size: 30px;font-weight: 600;text-align: center;margin-top: 30px;color:#111827">{{ __('landingPage.heading',['storename'=>$details['store'],'store_credit'=>$details['store_credit']]) }}</h3>
            <p  class="text-center mb-2" style="color: #FF5175;font-size: 20px;font-weight: 500;text-align: center;">{{$details['instruction_title']}}</p>
            <div style="padding-left:20px ;">
                @php
                $Lists=(json_decode($details['instructions'],true));

                @endphp
                @foreach ($Lists as $list)
                    <div style="display: flex;align-items: center;margin-bottom: 15px;">
                        <div style="background: #E5E7EB;padding: 8px 16px;border-radius: 50%;margin-right: 15px;color: #6B7280;">{{$loop->index + 1}}</div>
                        <p style="margin-bottom: 0;font-weight: 600;">{{$list['value']}}</p>
                    </div>
                @endforeach


            </div>
            <a  href="{{ route('uploadVideo' ,['locale' =>$details['locale'] ]).'?store='.$details['store']}}">
            <button type="button" class="btn btn-primary" style="cursor: pointer;border-radius: 6px;color:white; width: 100%;font-size: 20px;font-weight: 700;background: {{$details['page_color']}};height: 60px;border: none;">
                <i class="fa-solid fa-video"></i>  {{__('landingPage.button_text')}}
              </button></a>
              <h5 class=" mb-3 mt-4" style="text-align: center;font-size: 20px;color: #111827;">{{__('landingPage.footer_instruction_text')}}</h5>
              @if($details['video']=='undefined' || $details['video']=='')
              @else
                <video width="320" height="176" controls poster="{{ url('images/video_thumbnail.png') }}" src="{{ url('video/'.$details['video']) }}" style="display: block;margin: auto;">
                        <!-- fallback 1 -->
                        <a href="{{ url('video/'.$details['video']) }}" ><img height="176"  src="{{ url('images/video_thumbnail.png') }}" width="320" /></a>
                </video>
              @endif
              {{-- <img src="{{ env('APP_URL')}}/images/image 113.png" > --}}
              <div style="display: flex;justify-content: center;" >
                 <h5 style="font-size: 18px;color: #000;">Powered by </h5>
                    <div>
                        <img src="{{ env('APP_URL')}}/images/vidialLogo.png" style="margin: 35px 2 px 0px 10px;">
                    </div>
                 <h5 style="font-size: 18px;color: #000;">idial</h5>
              </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
  </body>
</html>
