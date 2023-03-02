@extends('layout.layout')
@section('content')
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-3 p-3">
            @include('landingPage.logo',['current_user_id'=>$settings->user_id])
            <h3 class="text-center mt-4 mb-3" style="font-size: 30px;font-weight: 600;">{{ __('landingPage.heading',['storename'=>splitStoreName($user->name),'store_credit'=>$settings->store_credit]) }}</h3>
            <p  class="text-center mb-2" style="color: #FF5175;font-size: 20px;font-weight: 500;">{{__('landingPage.instruction_text')}}</p>
            <div style="padding-left:20px ;">

                @php
                $Lists=(json_decode($settings->instructions,true));

                @endphp
                @foreach ($Lists as $list)
                <div style="display: flex;align-items: center;margin-bottom: 15px;">
                    <div style="background: #E5E7EB;padding: 8px 16px;border-radius: 50%;margin-right: 15px;color: #6B7280;">{{$loop->index + 1}}</div>
                    <p style="margin-bottom: 0;font-weight: 600;">{{$list['value']}}</p>
                </div>
                @endforeach

            </div>
            <button type="button"  class="btn btn-primary" id="redirect" store="{{ $user->name }}" locale= "{{ $settings->locale }}"   value="" style="width: 100%;font-size: 20px;font-weight: 700;background: {{$settings->page_color}};height: 60px;border: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" fill="currentColor" class="bi bi-camera-video-fill" viewBox="0 0 16 16">
                     <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"></path>
                </svg>
                Upload a short video
            </button>
            @if($settings->video)
              <h5 class="text-center mb-3 mt-4">{{__('landingPage.footer_instruction_text')}}</h5>

              <video  width="300px" height="531px"  controls style="display: block;margin: auto;">
                <source src="{{ url('video/'.$settings->video) }}" type="video/mp4">
              </video>
              @endif
             @include('landingPage.footer')
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js" integrity="sha512-STof4xm1wgkfm7heWqFJVn58Hm3EtS31XFaagaa8VMReCXAkQnJZ+jEy8PCC/iT18dFy95WcExNHFTqLyp72eQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  @endsection
