import {test, expect, describe} from 'vitest';
import { build, defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import ViteFaviconsPlugin, { ViteFaviconsPluginOptions } from '../src/index.js';

const outputDirectory = path.resolve(import.meta.dirname, '../test-output');

function getViteConfig (pluginOptions: ViteFaviconsPluginOptions = {}) {
	return defineConfig({
		build: {
			emptyOutDir: true,
			outDir: outputDirectory,
		},
		plugins: [
			ViteFaviconsPlugin(pluginOptions),
		],
	});
}

describe('Favicon Generation', () => {
	test('Default logo location is `/assets/logo.png`', async () => {
		const promise = build(getViteConfig());
		await expect(promise).rejects.toThrowError(`ENOENT: no such file or directory, open '${path.resolve(import.meta.dirname, '../assets/logo.png')}`);
	});

	test('Favicons are generated`', async () => {
		await build(getViteConfig({
			logo: path.resolve(import.meta.dirname, 'test-assets/Red_Logo_copyright.png'),
		}));
		expect(fs.existsSync(path.resolve(outputDirectory, 'favicon.ico'))).toBe(true);
	});
});
