@extends('shopify-app::layouts.default')

@section('content')
    <!-- You are: (shop domain name) -->
    {{-- <p>You are: {{ $shopDomain ?? Auth::user()->name }}</p> --}}
    {{-- <br> --}}
    {{-- <p>Hello from Laravel 9 2</p> --}}

    <div id="root"></div>
    {{ vite_assets() }}
@endsection

@section('scripts')
    @parent

    <script>

        // actions.TitleBar.create(app, { title: 'Welcome2333' });
    </script>

<script type="text/javascript">window.$crisp=[];window.CRISP_WEBSITE_ID="2ed80e41-6d28-4bbd-b674-105b887e9d6a";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>
@endsection
