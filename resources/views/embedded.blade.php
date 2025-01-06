@extends('shopify-app::layouts.default')

@section('styles')
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    {{-- @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"]) --}}
    @inertiaHead
@endsection

@section('content')
    @inertia
@endsection

@section('scripts')
    @parent
    <ui-nav-menu>
        <a href="/app-dashboard" rel="home">Dashboard</a>
        <a href="/">Get Started</a>
        <a href="/videos-to-review">Videos to Review</a>
        <a href="/approved-videos">Approved Videos</a>
        <a href="/settings">Settings</a>
        <a href="/email">Emails</a>
        <a href="/plans">Plans</a>
        <a href="/logs">Logs</a>
    </ui-nav-menu>
    <script>
        const {
                fetch: originalFetch
            } = window;

            window.fetch = async (...args) => {
                let [resource, config] = args;
                // request interceptor here
                let token = await shopify.idToken();
                config = {
                    ...config,
                    headers: {
                        ...config?.headers,
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
                const response = await originalFetch(resource, config);
                // response interceptor here
                return response;
            };
    </script>
@endsection
