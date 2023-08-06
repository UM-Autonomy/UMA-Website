import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: 'src/lib/benderson3d.ts',
			name: 'benderson3d',
			// the proper extensions will be added
			fileName: 'benderson3d',
			formats: ['iife']
		}
	}
});
