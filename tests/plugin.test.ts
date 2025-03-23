import {test, expect, describe, beforeAll} from 'vitest';
import { build, defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import ViteFaviconsPlugin, { ViteFaviconsPluginOptions } from '../src/index.js';

const testProjectRoot = path.resolve(import.meta.dirname, '../test-output');
const testProjectOutputDirectory = path.resolve(testProjectRoot, 'dist');
const tempHtmlPath = path.resolve(testProjectRoot, 'index.html');
const testLogo = path.resolve(import.meta.dirname, 'test-assets/Red_Logo_copyright.png');

beforeAll(() => {
	// Ensure the test project root exists
	fs.mkdirSync(testProjectRoot, {recursive: true});
	// Create a temporary HTML file to satisfy Vite's default input
	fs.writeFileSync(tempHtmlPath, '<!DOCTYPE html><html><head></head><body></body></html>');
});

function getViteConfig (pluginOptions: ViteFaviconsPluginOptions = {}) {
	return defineConfig({
		root: testProjectRoot,
		build: {
			// Make sure each test is going to be independently built
			emptyOutDir: true,
			outDir: testProjectOutputDirectory,
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
			logo: testLogo,
			inject: false,
		}));
		expect(fs.existsSync(path.resolve(testProjectOutputDirectory, 'assets', 'favicon.ico'))).toBe(true);
	});
});

describe('HTML Injection', () => {
	test('Favicons references are injected into the HTML code', async () => {
		await build(getViteConfig({
			logo: testLogo,
			inject: true,
		}));

		const generatedHtmlPath = path.resolve(testProjectOutputDirectory, 'index.html');
		expect(fs.existsSync(generatedHtmlPath)).toBe(true);

		const htmlContent = fs.readFileSync(generatedHtmlPath, 'utf8');
		expect(htmlContent).toContain('<link rel="icon" type="image/x-icon" href="/assets/favicon.ico">');
	});
});
