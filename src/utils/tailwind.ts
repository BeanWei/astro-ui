export function multipleVariant(variant: string, classNames: string | string[]) {
	const classNames_ = Array.isArray(classNames) ? classNames : classNames.split(' ').filter(Boolean)
	return classNames_.map((s) => `${variant}:${s}`).join(' ')
}
