import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        nodePolyfills({
            // Enable node polyfills for Solana
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            // Enable specific node built-in modules
            protocolImports: true,
        }),
    ],
    server: {
        port: 8080
    }
})
