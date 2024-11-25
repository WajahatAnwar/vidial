@component('mail::message')
<h2 style="color: rgb(37, 43, 59)">Hello {{ $data['name'] }}</h2>

<div style="color: rgb(37, 43, 59); margin-bottom:30px">
Please use this <a href="{{ $data['link'] }}"><b style="color: black">link</b></a> to reset your password. The link can be used once only.

<h2 style="color: rgb(37, 43, 59); margin-top:30px">
Thanks,<br>
{{ config('app.name') }}
</h2>
@endcomponent
