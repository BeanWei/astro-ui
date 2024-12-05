import { type VariantProps, tv } from 'tailwind-variants'

export const divider = tv({
	base: "flex items-center self-stretch whitespace-nowrap before:flex-grow before:content-[''] before:bg-border after:flex-grow after:content-[''] after:bg-border text-xs text-muted-foreground [&:not(:empty)]:gap-2",
	variants: {
		orientation: {
			horizontal: 'flex-row before:h-px before:w-full after:h-px after:w-full',
			vertical: 'flex-col before:w-px before:h-full after:w-px after:h-full',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
})

export type DividerVariantProps = VariantProps<typeof divider>
