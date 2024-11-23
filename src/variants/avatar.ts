import { type VariantProps, tv } from 'tailwind-variants'

export const avatar = tv({
	base: 'inline-flex items-center justify-center font-medium select-none shrink-0 overflow-hidden',
	variants: {
		size: {
			sm: 'h-8 w-8 text-xs',
			md: 'h-10 w-10 text-sm',
			lg: 'h-14 w-14 text-md',
		},
		shape: {
			circle: 'rounded-full',
			square: 'rounded-md',
		},
		variant: {
			solid: 'bg-primary text-primary-foreground',
			outline: 'bg-background border border-input',
			subtle: 'text-foreground bg-secondary',
		},
	},
	defaultVariants: {
		size: 'md',
		shape: 'circle',
		variant: 'subtle',
	},
})

export type AvatarVariantProps = VariantProps<typeof avatar>
