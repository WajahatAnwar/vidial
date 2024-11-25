import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 5000,
        rollupOptions: {
            onwarn(warning, warn) {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                warn(warning)
            }
        }
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        include: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/material/Tooltip'
        ],
    },
});
