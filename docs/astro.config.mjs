import starlight from '@astrojs/starlight'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import simpleScope from 'vite-plugin-simple-scope'

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'AstroUI',
			social: {
				github: 'https://github.com/beanwei/astro-ui',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Introduction', slug: 'guides/introduction' },
						{ label: 'Installation', slug: 'guides/installation' },
					],
				},
				{
					label: 'Components',
					autogenerate: { directory: 'components' },
				},
			],
			customCss: ['./src/custom.css'],
		}),
		tailwind({ applyBaseStyles: false }),
		icon({
			include: {
				lucide: ['chevron-right', 'mail-open', 'user', 'circle-alert', 'circle-check', 'x'],
			},
		}),
	],
	vite: {
		plugins: [simpleScope()],
	},
})
