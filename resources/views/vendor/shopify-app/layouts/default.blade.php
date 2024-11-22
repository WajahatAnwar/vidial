<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ \Osiset\ShopifyApp\Util::getShopifyConfig('app_name') }}</title>
    @yield('styles')
</head>

<body>
    <div class="app-wrapper">
        <div class="app-content">
            <main role="main">
                @yield('content')
            </main>
        </div>
    </div>

    @if (\Osiset\ShopifyApp\Util::getShopifyConfig('appbridge_enabled') && \Osiset\ShopifyApp\Util::useNativeAppBridge())
        <script
            src="https://unpkg.com/@shopify/app-bridge{{ \Osiset\ShopifyApp\Util::getShopifyConfig('appbridge_version') ? '@' . config('shopify-app.appbridge_version') : '' }}">
        </script>
        <script
            src="https://unpkg.com/@shopify/app-bridge-utils{{ \Osiset\ShopifyApp\Util::getShopifyConfig('appbridge_version') ? '@' . config('shopify-app.appbridge_version') : '' }}">
        </script>
        <script @if (\Osiset\ShopifyApp\Util::getShopifyConfig('turbo_enabled')) data-turbolinks-eval="false" @endif>
            var AppBridge = window['app-bridge'];
            var actions = AppBridge.actions;
            var utils = window['app-bridge-utils'];
            var createApp = AppBridge.default;
            var app = createApp({
                apiKey: "{{ \Osiset\ShopifyApp\Util::getShopifyConfig('api_key', $shopDomain ?? Auth::user()->name) }}",
                host: "{{ \Request::get('host') }}",
                forceRedirect: true,
            });
            let shopNm = "{{ $shopDomain ?? Auth::user()->name }}";
            
            /**** saving query params for fetch calls *****/
            localStorage.setItem('queryParams', window.location.search);
            const history = actions.History.create(app);

                // const dashboardLink = actions.AppLink.create(app, {
                // label: 'Dashboard',
                // destination: '/',
                // });


                const getstartedBlock = actions.AppLink.create(app, {
                label: 'Get Started',
                destination: '/get-started',
                });

                const dashboardBlock = actions.AppLink.create(app, {
                label: 'Dashboard',
                destination: '/dashboard',
                });
                const videostoreviewblock = actions.AppLink.create(app, {
                label: 'Videos to Review',
                destination: `/videos-to-review${location.search}`,
                });
                const approvedvideosblock = actions.AppLink.create(app, {
                label: 'Approved Videos',
                destination: '/approved-videos',
                });
                const landingpageblock = actions.AppLink.create(app, {
                label: 'Landing Page',
                destination: '/settings',
                });
                const emails = actions.AppLink.create(app, {
                label: 'Emails',
                destination: '/email',
                });
                const plans = actions.AppLink.create(app, {
                label: 'Plans',
                destination: '/plans',
                });
                const logs = actions.AppLink.create(app, {
                label: 'logs',
                destination: '/logs',
                });





                // create NavigationMenu with no active links
                const navigationMenu = actions.NavigationMenu.create(app, {
                items: [getstartedBlock,dashboardBlock,videostoreviewblock, approvedvideosblock,landingpageblock, emails,plans,logs, ], });




        // if (selectedTabIndex == 0) {
        //     setSelected(selectedTabIndex);
        //     navigate(`/dashboard${search}`);
        // } else if (selectedTabIndex == 1) {
        //     setSelected(selectedTabIndex);
        //     navigate(`/videos-to-review${search}`);
        // } else if (selectedTabIndex == 2) {
        //     setSelected(selectedTabIndex);
        //     navigate("/approved-videos");
        // } else if (selectedTabIndex == 3) {
        //     setSelected(selectedTabIndex);
        //     navigate("/settings");
        // } else if (selectedTabIndex == 4) {
        //     setSelected(selectedTabIndex);
        //     navigate("/email" + location.search);
        // }else if (selectedTabIndex == 5) {
        //     setSelected(selectedTabIndex);
        //     navigate("/plans" + location.search);
        // }
        // else if (selectedTabIndex == 6) {
        //     setSelected(selectedTabIndex);
        //     navigate("/logs" + location.search);
        // }










            const {
                fetch: originalFetch
            } = window;

            window.fetch = async (...args) => {
                let [resource, config] = args;
                // request interceptor here
                let token = await utils.getSessionToken(app);
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

        @include('shopify-app::partials.token_handler')
        @include('shopify-app::partials.flash_messages')
    @endif

    @yield('scripts')
</body>

</html>
