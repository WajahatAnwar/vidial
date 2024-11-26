@php
$settings = \App\Models\Setting::where('user_id',$current_user_id)->first();
@endphp
@if($settings->logo=='undefined' || $settings->logo=='')

@else
<img style="display: block;margin: auto;max-width: 175px;max-height: 175px;"  src="{{asset('logo/'.$settings->logo)}}">
@endif
