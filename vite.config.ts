import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..']
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    pdfjs: ['pdfjs-dist']
                }
            }
        }
    }
})
