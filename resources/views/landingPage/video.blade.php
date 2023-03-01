@extends('layout.layout')
@section('content')
<div>
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-3 p-3">
           @include('landingPage.logo',['current_user_id'=>$settings->user_id])
            <h3 class="text-center mt-4 " style="font-size: 30px;font-weight: 700;">{{ __('uploadVideo.heading') }}</h3>
            <p  class="text-center " style="font-size: 18px;margin-bottom: 25px">{{ __('uploadVideo.subheading',['storename'=>splitStoreName($user->name)]) }}</p>

            <div class="demo-container">
                <div class="widget-container flex-box">
                  <div id="dropzone-external" class="flex-box dx-theme-border-color">
                    <img id="dropzone-image" src="#" hidden alt="" />
                    <div id="dropzone-text" class="flex-box">
                        <h3  style="font-size: 29px;font-weight: 700;color: #FF5175;">{{ __('uploadVideo.video_upload_heading') }}</h3>
                        <p style="font-size: 15px;margin-bottom: 0;">{{ __('uploadVideo.video_upload_subheading') }}</p>
                    </div>
                    <div id="upload-progress"></div>
                  </div>
                  <div id="file-uploader"></div>
                </div>
                <div class="alert alert-danger d-none"  id="error-video" role="alert">
                </div>
              </div>
              <p class=" mt-4 mb-2" style="font-size: 15px;margin-left: 20px;">{{ __('uploadVideo.address_text') }}</p>

              <input type="email" class="form-control emialInput mt-3 " id="email" placeholder="name@example.com">

              <div class="alert alert-danger d-none"  id="error-email" role="alert">
            </div>
              <div class="form-check mt-4 ">
                <input class="form-check-input" type="checkbox" value="true" id="terms_condition"  checked>
                <label class="form-check-label" for="flexCheckChecked" style="font-size: 13px;">
                    {{ __('uploadVideo.terms_condition_text',['storename'=>splitStoreName($user->name)]) }}
                </label>
                <div class="alert alert-danger d-none" id="error-terms-conditions" role="alert">

                  </div>

              </div>

              <button class="btn btn-primary mt-4" onclick="saveVideo()" type="button" style="    width: 100%;font-size: 20px;font-weight: 600;background: {{$settings->page_color}};border: none;">{{ __('uploadVideo.button_text') }}</button>
              <!-- Modal -->
  <div class="modal fade" id="success_popup" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-4 ">
        {{-- <img style="display: block;margin: auto;margin-top: 20px;" src="image 112.png"> --}}
        @include('landingPage.logo',['current_user_id'=>$settings->user_id])
        <img  style="display: block;margin: auto;margin-top: 40px; margin-bottom: 40px;" src="{{ url('/images/accepted_1.png') }}">
        <h3 class="text-center mt-4 " style="font-size: 30px;font-weight: 700;">{{ __('successPage.heading') }}</h3>
        <p  class="text-center " style="font-size: 15px;margin-bottom: 25px;margin-top: 20px;">{{ __('successPage.subheading') }}</p>
      </div>
    </div>
  </div>
              @include('landingPage.footer')
        </div>
    </div>
</div>
@endsection
