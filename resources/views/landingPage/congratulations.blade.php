@extends('layout.layout')
@section('content')
   <div>
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-3 p-4">
        @include('landingPage.logo',['current_user_id'=>$current_user_id])
            {{-- <img style="display: block;margin: auto;" src="image 112.png"> --}}
            <img  style="display: block;margin: auto;margin-top: 40px; margin-bottom: 40px;" src="{{ url('/images/accepted_1.png') }}">
            <h3 class="text-center mt-4 " style="font-size: 30px;font-weight: 700;">Your video was successfully sent to the store.</h3>
            <p  class="text-center " style="font-size: 15px;margin-bottom: 25px;margin-top: 20px;">Expect to hear back about your video review within a few days. Upon approval, the gift card will be emailed to you.</p>
            <a href="#" style="color: #FF5175;font-weight: 600;font-size: 24px;margin-top: 20px;margin-bottom: 20px;text-align: center;">Return to (store) →</a>
        </div>
    </div>
</div>

     @endsection
