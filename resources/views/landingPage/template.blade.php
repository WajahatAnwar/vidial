@extends('layout.layout')
@section('content')
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family={{ str_replace(' ', '+', $settings->instruction_title_font) }}" />

    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-4 p-3" style="padding-left: 20px !important;padding-right: 20px !important;">
            @include('landingPage.logo', ['current_user_id' => $settings->user_id])
            {{-- <h3 class="text-center mt-4 mb-3 adjustHeaddingSize" style="font-size: 30px;font-weight: 600;">{{ __('landingPage.heading',['storename'=>splitStoreName($user->name),'store_credit'=>$settings->store_credit]) }}</h3> --}}
            <h3 class="text-center mt-4 mb-3 adjustHeaddingSize"
                style="font-size: 30px;font-weight: 600; font-family:{{ $settings->instruction_title_font }}">
                {{ $settings->instruction_title }}</h3>


            <p class="text-center mb-2" style="color: {{ $settings->page_color }};font-size: 20px;font-weight: 500; font-family:{{ $settings->instruction_title_font }}">
                {{ $settings->instruction_subtitle ? $settings->instruction_subtitle : 'Please follow the instructions below:' }}
            </p>
            <div style="">

                @php
                    $Lists = json_decode($settings->instructions, true);

                @endphp
                <div class="stepsWrapper" style="margin: auto;display: block;">
                    @foreach ($Lists as $list)
                        <div style="display: flex;align-items: center;margin-bottom: 15px;">
                            @if ($settings->instruction_count === 'circle')
                                <div
                                    style="font-family:{{ $settings->instruction_title_font }}; background: #E5E7EB;padding: 8px 16px;border-radius: 50%;margin-right: 15px;color: #6B7280; {{ $loop->index == 0 ? 'padding: 8px 18px;' : '' }} ">
                                    {{ $loop->index + 1 }}</div>
                            @else
                                <div
                                    style="font-family:{{ $settings->instruction_title_font }}; background: #E5E7EB;padding: 8px 16px;border-radius: 2%;margin-right: 15px;color: #6B7280; {{ $loop->index == 0 ? 'padding: 8px 18px;' : '' }} ">
                                    {{ $loop->index + 1 }}</div>
                            @endif
                            <p style="margin-bottom: 0;font-weight: 500; font-family:{{ $settings->instruction_title_font }}">{{ $list['value'] }}</p>
                        </div>
                    @endforeach
                </div>

            </div>
            @if ($settings->instruction_button_style === 'squaree')
                <button type="button" class="btn btn-primary savevedio_redirect" id="redirect"
                    store="{{ $user->name }}" locale= "{{ $settings->locale }}" value=""
                    style="width: 100%;font-size: 20px;font-weight: 700;background: {{ $settings->page_color }};height: 60px;border: none; font-family:{{ $settings->instruction_title_font }}">
                    {{ $settings->video_btn_text ? $settings->video_btn_text : __('landingPage.button_text') }}
                </button>
            @else
                <button type="button" class="btn btn-primary savevedio_redirect" id="redirect"
                    store="{{ $user->name }}" locale= "{{ $settings->locale }}" value=""
                    style="width: 100%;font-size: 20px;font-weight: 700;background: {{ $settings->page_color }};height: 60px;border: none; border-radius:50px; font-family:{{ $settings->instruction_title_font }}">
                    {{ $settings->video_btn_text ? $settings->video_btn_text : __('landingPage.button_text') }}
                </button>
            @endif
            @if ($settings->video == 'undefined' || $settings->video == '')
            @else
                <h5 class="text-center mb-3 mt-4" style="font-family:{{ $settings->instruction_title_font }}">
                    {{ $settings->inspirational_video_title ? $settings->inspirational_video_title : __('landingPage.footer_instruction_text') }}
                </h5>

                <video muted autoPlay loop width="300px" height="531px" playsinline controls
                    style="display: block;margin: auto;    border-radius: 16px;box-shadow: #0000000d 0 1.25rem 1.6875rem!important;margin-bottom: 50px;">
                    <source src="{{ url('video/' . $settings->video) }}" type="video/mp4">
                </video>
            @endif
            <div style="display: flex;justify-content: center;" class="mt-4">
                @if ($user->water_mark == 0)
                    <h5>Powered by </h5>
                    <div style="margin-left: 10px;">
                        {{-- <img style="width: 65px;" src="{{asset('images/vidialLogoPower.png')}}"> --}}
                        <img style="width: 130px;" src="{{ asset('images/landing_footer.png') }}">
                    </div>
                @endif
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous">
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"
        integrity="sha512-STof4xm1wgkfm7heWqFJVn58Hm3EtS31XFaagaa8VMReCXAkQnJZ+jEy8PCC/iT18dFy95WcExNHFTqLyp72eQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
@endsection
