import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'Small Storage',
            fileName: (format) => `zstore.${format}.js`,
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