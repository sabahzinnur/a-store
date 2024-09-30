import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'Small Storage',
            fileName: (format) => `a-store.${format}.js`,
        },
        rollupOptions: {
            // Укажите зависимости, которые не должны быть включены в вашу библиотеку
            external: [],
            output: {
                globals: {},
            },
        },
    },
    plugins: [
        dts({
            outDir: 'dist',
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.json',
            rollupTypes: true,
            cleanVueFileName: true,
        })
    ],
});