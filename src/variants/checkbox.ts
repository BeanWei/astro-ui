import { type VariantProps, tv } from 'tailwind-variants'

export const checkbox = tv({
	slots: {
		base: 'flex items-start gap-2',
		control:
			'flex items-center justify-center text-current size-4 shrink-0 rounded border border-input shadow-sm shadow-black/5 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:hidden peer-checked:[&_svg]:block peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground',
	},
	variants: {
		mode: {
			default: {},
			card: {
				base: 'relative w-full rounded-lg border border-input p-4 shadow-sm shadow-black/5 cursor-pointer has-[:checked]:border-ring',
			},
		},
		align: {
			left: {},
			right: {
				base: 'justify-between',
				control: 'order-1 after:absolute after:inset-0',
			},
		},
	},
	defaultVariants: {
		mode: 'default',
		align: 'left',
	},
})

export type CheckboxVariantProps = VariantProps<typeof checkbox>
