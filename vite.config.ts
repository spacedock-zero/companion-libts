import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'CompanionLib',
			fileName: () => 'companion-lib.js',
			formats: ['iife'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			output: {
				extend: true,
			}
		}
	},
});
