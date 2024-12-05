let i = 0

export default (prefix: string) => {
	const id = `${++i}`
	return prefix ? `${prefix}_${id}` : id
}
