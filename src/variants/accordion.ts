import { type VariantProps, tv } from 'tailwind-variants'
import { multipleVariant } from '../utils/tailwind'

export const accordion = tv({
	slots: {
		base: 'group',
		item: [
			'group border-b border-border py-2',
			multipleVariant(
				'group-data-[accordion-variant=bordered]',
				'border bg-background px-4 py-1 first:rounded-t-lg last:rounded-b-lg'
			),
			multipleVariant(
				'group-data-[accordion-variant=splitted]',
				'rounded-lg border bg-background px-4 py-1'
			),
		],
		header: [
			'flex flex-1 items-center justify-between py-2 text-left font-medium text-[15px] leading-6 group-open:[&>svg]:rotate-180',
		],
		panel: ['overflow-hidden text-sm'],
	},
	variants: {
		variant: {
			light: {},
			bordered: {
				base: '-space-y-px',
			},
			splitted: {
				base: 'space-y-2',
			},
		},
	},
	defaultVariants: {
		variant: 'light',
	},
})

export type AccordionVariantProps = VariantProps<typeof accordion>
