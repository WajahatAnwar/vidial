import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Provider } from 'react-redux';
import { store } from '@/ReactJs/ReduxStores/store';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';
window.appURL = import.meta.env.VITE_APP_URL;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./ReactJs/${name}.jsx`, import.meta.glob('./ReactJs/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <Provider store={store}>
                <App {...props} />
            </Provider>,
        document.getElementById('root')
        );
    },
    progress: {
        color: '#4B5563',
    },
});
