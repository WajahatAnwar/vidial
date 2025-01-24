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
        // actions.TitleBar.create(app, { title: 'Welcome' });
    </script>
@endsection
