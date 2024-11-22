import starlight from '@astrojs/starlight-tailwind'
import astroui from '@beanwei/astro-ui/tailwind'
import { isolateInsideOfContainer, scopedPreflightStyles } from 'tailwindcss-scoped-preflight'

/** @type {import('tailwindcss').Config} */
export default {
	presets: [astroui()],
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./node_modules/@beanwei/astro-ui/src/**/*.{astro,ts}',
	],
	plugins: [
		starlight(),
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer('[data-part]'),
		}),
	],
}
