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
        <a href="/">Get Started</a>
        <a href="/app-dashboard">Dashboard</a>
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
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-N4VDTDHF16"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N4VDTDHF16');
</script>
   <script src="https://cdn.heymantle.com/mantle_apptrack.js?appToken=47d2c6ef55518af760503c87715caf78"> </script>
@endsection
