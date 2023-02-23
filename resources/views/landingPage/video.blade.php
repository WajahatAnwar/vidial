@extends('layout.layout')
@section('content')
<div>
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-3 p-3">
           @include('landingPage.logo',['current_user_id'=>$settings->user_id])
            <h3 class="text-center mt-4 " style="font-size: 30px;font-weight: 700;">Upload Your Video</h3>
            <p  class="text-center " style="font-size: 18px;margin-bottom: 25px">The video will be used in social media and/or the Thinx website.</p>
           
            <div class="demo-container">
                <div class="widget-container flex-box">
                  <div id="dropzone-external" class="flex-box dx-theme-border-color">
                    <img id="dropzone-image" src="#" hidden alt="" />
                    <div id="dropzone-text" class="flex-box">
                        <h3  style="font-size: 29px;font-weight: 700;color: #FF5175;">Drag & Drop or Browse</h3>
                        <p style="font-size: 15px;margin-bottom: 0;">Upload formats: MP4 (Up to 500 MB)</p>
                    </div>
                    <div id="upload-progress"></div>
                  </div>
                  <div id="file-uploader"></div>
                </div>
              </div>
              <p class=" mt-4 mb-2" style="font-size: 15px;margin-left: 20px;">Enter your address mail so we can send you the gift card:</p>
              
              <input type="email" class="form-control emialInput mt-3 " id="exampleFormControlInput1" placeholder="name@example.com">
              <div class="form-check mt-4 ">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>
                <label class="form-check-label" for="flexCheckChecked" style="font-size: 13px;">
                    I accept that Thinx may use my video in social medias or in his website
                </label>
              </div>
              <button class="btn btn-primary mt-4" type="button" style="    width: 100%;font-size: 20px;font-weight: 600;background: {{$settings->page_color}};border: none;">Save</button>
                 @include('landingPage.footer')
        </div>  
    </div>
</div>
@endsection