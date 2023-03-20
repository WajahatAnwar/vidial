@extends('layout.layout')
@section('content')
<div>
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-4 p-3" style="padding-left: 20px !important;padding-right: 20px !important;">
           @include('landingPage.logo',['current_user_id'=>$settings->user_id])
            <h3 class="text-center mt-4 adjustHeaddingSize" style="font-size: 30px;font-weight: 700;">{{ __('uploadVideo.heading') }}</h3>
            <p  class="text-center " style="font-size: 18px;margin-bottom: 25px">{{ __('uploadVideo.subheading',['storename'=>splitStoreName($user->name)]) }}</p>

            <div class="demo-container">
                <div class="widget-container flex-box">
                  <div id="dropzone-external" class="flex-box dx-theme-border-color">
                    <img id="dropzone-image" src="#" hidden alt="" />
                    <div id="dropzone-text" class="flex-box">
                        <h3  style="font-size: 29px;font-weight: 700;color: #FF5175;text-align: center;">{{ __('uploadVideo.video_upload_heading') }}</h3>
                        <p style="font-size: 15px;margin-bottom: 0;text-align: center;">{{ __('uploadVideo.video_upload_subheading') }}</p>
                    </div>
                    <div id="upload-progress"></div>
                  </div>
                  <div id="file-uploader"></div>
                  <div id="uploaded-file-name"></div>
                  <span style="display: none;text-align: center;margin-top:0px;padding-top:0px;"   class="loading_details">
                    <img  src="{{asset('loader/loader.gif')}}" style="width: 100px;height:100px;" alt="">
                  </span>
                </div>

                <div class="alert alert-danger d-none"  id="error-video" role="alert">
                    <svg style="width: 16px;margin-right: 5px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="#b02a37"></path></g></svg>
                    <p id="error-video-text" style="margin-bottom: 0;" ></p>
                </div>
              </div>
              <video autoplay loop muted width="300px" height="531px" id="uploadeVideoPreview" controls
                    style="display: none;margin: auto;    border-radius: 16px;box-shadow: #0000000d 0 1.25rem 1.6875rem!important;margin-bottom: 50px;margin-top: 50px;">
                    <source id="video_inside_id" src="" type="video/mp4">
                </video>
              <p class=" mt-4 mb-2" style="font-size: 15px;margin-left: 20px;">{{ __('uploadVideo.address_text') }}</p>

              <input type="email" class="form-control emialInput mt-3 " pattern="/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
              required id="email" placeholder="name@example.com">

              <div class="alert alert-danger d-none"  id="error-email" role="alert">
              <svg style="width: 16px;margin-right: 5px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="#b02a37"></path></g></svg>
                    <p id="error-email-text" style="margin-bottom: 0;" ></p>
            </div>
              <div class="form-check " style="margin-top: 40px ;">
                <input class="form-check-input" type="checkbox" value="true" id="terms_condition"  checked>
                <label class="form-check-label" for="flexCheckChecked" style="font-size: 13px;">
                    {{ __('uploadVideo.terms_condition_text',['aTag'=>"https://app.vidial.com/terms_and_conditions"]) }}
                    <a href="{{ asset('files/terms_and_conditions.pdf') }}" target="_blank">{{ __('uploadVideo.terms_condition_anchor_text',['text'=>'Terms & Conditions']) }}</a>
                </label>
                <div class="alert alert-danger d-none" id="error-terms-conditions" role="alert">

                  </div>
                  <input type="hidden" id="lang" name="lang" value="{{Lang::locale()}}">
              </div>

              <button class="btn btn-primary mt-4" onclick="saveVideo()" type="button" id="saveBTN" style="margin-bottom: 50px;    width: 100%;font-size: 20px;font-weight: 600;background: {{$settings->page_color}};border: none;">{{ __('uploadVideo.button_text') }}</button>
              <!-- Modal -->
  <div class="modal fade" id="success_popup" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-4 ">
        {{-- <img style="display: block;margin: auto;margin-top: 20px;" src="image 112.png"> --}}
        @include('landingPage.logo',['current_user_id'=>$settings->user_id])
        <img  style="display: block;margin: auto;margin-top: 40px; margin-bottom: 40px;" src="{{ url('/images/accepted_1.png') }}">
        <h3 class="text-center mt-4 " style="font-size: 30px;font-weight: 700;">{{ __('successPage.heading') }}</h3>
        <p  class="text-center " style="font-size: 15px;margin-bottom: 25px;margin-top: 20px;">{{ __('successPage.subheading') }}</p>
        <a href="#" style="color: #FF5175;font-weight: 600;font-size: 24px;margin-top: 20px;margin-bottom: 20px;text-align: center;">Return to (store) →</a>
      </div>
    </div>
  </div>
              @include('landingPage.footer')
        </div>
    </div>
</div>
@endsection
