// fork from https://github.com/egoist/snackbar

export type Position = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'

export type Type = 'info' | 'success' | 'warning' | 'error' | 'loading' | (string & {})

export interface ToastBaseOptions {
	/**
	 * The unique id of the toast
	 */
	id?: string
	/**
	 * The title of the toast.
	 */
	title?: string
	/**
	 * The description of the toast.
	 */
	description?: string
	/**
	 * The type of the toast
	 */
	type?: Type
}

export interface ToastOptions extends ToastBaseOptions {
	/**
	 * Automatically destroy the toast in specific duration (ms)
	 * @default `5000|2000|Infinity`, 0 means we won't automatically destroy the toast
	 */
	duration?: number
	/**
	 * Show toast in given position
	 * @default `top-right`
	 */
	position?: Position
	/**
	 * Maximum toasts to display, earlier created toast will be hidden
	 * @default 3
	 */
	maxVisible?: number
}

const instances: Record<Position, Toast[]> = {
	top: [],
	'top-left': [],
	'top-right': [],
	bottom: [],
	'bottom-left': [],
	'bottom-right': [],
}
const stackStatus: Record<Position, boolean> = {
	top: true,
	'top-left': true,
	'top-right': true,
	bottom: true,
	'bottom-left': true,
	'bottom-right': true,
}

const typeIcon: Record<
	Type,
	{
		color: string
		graph: string
	}
> = {
	info: {
		color: 'text-blue-500',
		graph: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
	},
	success: {
		color: 'text-emerald-500',
		graph: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
	},
	warning: {
		color: 'text-amber-500',
		graph:
			'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
	},
	error: {
		color: 'text-red-500',
		graph:
			'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
	},
	loading: { color: '', graph: '' },
}

interface ToastInstanceOptions extends ToastBaseOptions {
	duration: number
	position: Position
	maxVisible: number
}

function instanceOptions(options: ToastOptions = {}): ToastInstanceOptions {
	const {
		duration = options.type === 'loading'
			? Number.POSITIVE_INFINITY
			: options.type === 'success'
				? 2000
				: 5000,
		position = 'top-right',
		maxVisible = 3,
		...baseOpts
	} = options
	return {
		...baseOpts,
		duration,
		position,
		maxVisible,
	}
}

export class Toast {
	options: ToastInstanceOptions
	root: HTMLDivElement
	el?: HTMLDivElement
	private timeoutId?: number
	private height = 0

	constructor(options: ToastOptions = {}) {
		this.options = instanceOptions(options)
		this.root = Toast.getRoot(this.options.position)
		this.upsert()
	}

	private static getRoot(position: Position): HTMLDivElement {
		let root = document.querySelector<HTMLDivElement>(
			`[data-part="toast-root"][data-ctx-position="${position}"]`
		)
		if (!root) {
			root = document.createElement('div')
			root.setAttribute('data-part', 'toast-root')
			root.setAttribute('data-ctx-position', position)
			let styles = 'position: fixed; display: flex; flex-direction: column; z-index: 2147483647;'
			const [yPos, xPos] = position.split('-')
			if (yPos) {
				styles += ` ${yPos}: max(env(safe-area-inset-${yPos}, 0px), 24px);`
			}
			if (xPos === 'right') {
				styles +=
					' align-items: flex-end; inset-inline-end: calc(env(safe-area-inset-right, 0px) + 24px);'
			} else if (xPos === 'left') {
				styles +=
					' align-items: flex-start; inset-inline-start: calc(env(safe-area-inset-left, 0px) + 24px);'
			} else {
				styles += ' align-items: center'
			}
			root.setAttribute('style', styles)
			document.body.appendChild(root)
		}
		return root
	}

	upsert() {
		// icon
		const iconMeta = this.options.type ? typeIcon[this.options.type] : null
		const iconHtml = iconMeta
			? `<svg data-part="toast-item-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${iconMeta.color}">${iconMeta.graph}</svg>`
			: ''
		// content
		const contentHtml = `${
			this.options.title ? `<p class="text-sm font-medium">${this.options.title || ''}</p>` : ''
		}${
			this.options.description
				? `<p class="text-sm text-muted-foreground">${this.options.description || ''}</p>`
				: ''
		}`

		// update
		if (this.el) {
			const iconEl = this.el.querySelector<HTMLElement>('[data-part="toast-item-icon"]')
			if (iconEl) {
				iconEl.innerHTML = iconHtml
			}
			const contentWrapper = this.el.querySelector<HTMLDivElement>(
				'[data-part="toast-item-content"]'
			)
			if (contentWrapper) {
				contentWrapper.innerHTML = contentHtml
			}
			// reset timer
			this.stopTimer()
			this.startTimer()
			return
		}

		// insert
		const el = document.createElement('div')
		el.setAttribute('data-part', 'toast-item')
		let styles =
			'position: absolute; pointer-events: auto; width: 400px; overflow-wrap: anywhere; will-change: translate, opacity, scale; transition: all 400ms cubic-bezier(0.21, 1.02, 0.73, 1); opacity: 0;'
		const [yPos] = this.options.position.split('-')
		let initialTransform = ''
		if (yPos === 'top') {
			styles += ' top: 0;'
			initialTransform = 'translateY(-100%)'
		} else if (yPos === 'bottom') {
			styles += ' bottom: 0;'
			initialTransform = 'translateY(100%)'
		}
		styles += ` z-index: ${instances[this.options.position].length + 1};`
		el.setAttribute('style', styles)

		const container = document.createElement('div')
		container.className =
			'rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5 flex gap-2'
		container.innerHTML = `<div class="flex grow gap-3"><div data-part="toast-item-icon" class="mt-0.5 shrink-0">${iconHtml}</div><div data-part="toast-item-content" class="space-y-1">${contentHtml}</div></div>`
		el.appendChild(container)
		// close button
		const button = document.createElement('button')
		button.className =
			'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:text-accent-foreground group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent'
		button.setAttribute('aria-label', 'Close notification')
		button.setAttribute('data-part', 'toast-item-close-trigger')
		button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`
		button.addEventListener('click', () => {
			this.stopTimer()
			this.destroy()
		})
		container.appendChild(button)
		// gap
		const ghostEl = document.createElement('span')
		ghostEl.setAttribute(
			'style',
			'position: absolute; left: 0px; height: 15px; bottom: 100%; width: 100%;'
		)
		el.appendChild(ghostEl)

		el.style.transform = initialTransform

		el.addEventListener('mouseenter', () => this.expand())
		el.addEventListener('mouseleave', () => this.stack())

		this.el = el
		this.root.prepend(el)

		// Start animation after insert
		requestAnimationFrame(() => {
			this.height = el.clientHeight // Get height after render
			el.style.opacity = '1'
			el.style.transform = 'translateY(0)'
			this.startTimer()
		})

		instances[this.options.position].unshift(this)
		this.stack()
	}

	private updateTransforms() {
		const positionInstances = instances[this.options.position]
		const isStacked = stackStatus[this.options.position]
		const [yPos] = this.options.position.split('-')

		const transformUpdates = positionInstances.map((instance, i) => {
			const { el, height } = instance
			if (!el) return

			let transform = ''
			let opacity = '1'
			let visibility = 'visible'

			if (isStacked) {
				const offset = yPos === 'top' ? i * 15 : -i * 15
				transform = `translateY(${offset}px) scale(${1 - i * 0.05})`
				instance.startTimer()
			} else {
				const offset = yPos === 'top' ? i * (height + 15) : -i * (height + 15)
				transform = `translateY(${offset}px) scale(1)`
				instance.stopTimer()
			}

			if (i >= this.options.maxVisible) {
				opacity = '0'
				visibility = 'hidden'
			}

			return { el, transform, opacity, visibility }
		})

		requestAnimationFrame(() => {
			for (const item of transformUpdates) {
				if (item) {
					const { el, transform, opacity, visibility } = item
					el.style.transform = transform
					el.style.opacity = opacity
					el.style.visibility = visibility
				}
			}
		})
	}

	stack() {
		stackStatus[this.options.position] = true
		this.updateTransforms()
	}

	expand() {
		stackStatus[this.options.position] = false
		this.updateTransforms()
	}

	/**
	 * Destory the toast
	 */
	destroy() {
		const { el } = this
		if (!el) {
			return
		}
		el.style.opacity = '0'
		el.remove()
		instances[this.options.position] = instances[this.options.position].filter(
			(item) => item.el !== el
		)
		this.updateTransforms()
		let i = instances[this.options.position].length
		for (const item of instances[this.options.position]) {
			if (item.el) {
				item.el.style.zIndex = i.toString()
				i--
			}
		}
	}

	startTimer() {
		if (this.options.duration && !this.timeoutId) {
			this.timeoutId = self.setTimeout(() => this.destroy(), this.options.duration)
		}
	}

	stopTimer() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = undefined
		}
	}
}

export function create(options: ToastOptions) {
	new Toast(options)
	return true
}

export function update(id: string, options: ToastOptions) {
	for (const pos of Object.keys(instances) as Position[]) {
		for (const item of instances[pos]) {
			if (item.options.id === id) {
				item.options = instanceOptions(options)
				item.upsert()
				return true
			}
		}
	}
	return false
}

export function upsert(options: ToastOptions) {
	if (options.id) {
		return update(options.id, options) || create(options)
	}
	return create(options)
}

export function remove(id?: string) {
	if (id) {
		for (const pos of Object.keys(instances) as Position[]) {
			for (const item of instances[pos]) {
				if (item.options.id === id) {
					item.destroy()
					return
				}
			}
		}
	} else {
		for (const el of document.querySelectorAll<HTMLDivElement>('[data-part="toast-root"]')) {
			el.style.opacity = '0'
			el.remove()
			const pos = el.getAttribute('data-ctx-position') as Position | null
			if (pos) {
				instances[pos] = []
			}
		}
	}
}
