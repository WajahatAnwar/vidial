@php
$settings = \App\Models\Setting::where('user_id',$current_user_id)->first();
@endphp
<img style="display: block;margin: auto;" width="max-width:200px" src="{{asset('logo/'.$settings->logo)}}">
