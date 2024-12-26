// fork from https://github.com/egoist/snackbar

export type Position = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'

export interface ToastOptions {
	/**
	 * Automatically destroy the toast in specific duration (ms)
	 * @default `0` means we won't automatically destroy the toast
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

interface ToastInstanceOptions {
	duration: number
	position: Position
	maxVisible: number
}

type Message = { title?: string; content?: string } | HTMLElement

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

export class Toast {
	message: Message
	options: ToastInstanceOptions
	root: HTMLDivElement
	el?: HTMLDivElement
	private timeoutId?: number
	private height = 0

	constructor(message: Message, options: ToastOptions = {}) {
		const { duration = 0, position = 'top-right', maxVisible = 3 } = options
		this.message = message
		this.options = {
			duration,
			position,
			maxVisible,
		}

		this.root = Toast.getRoot(this.options.position)
		this.insert()
		instances[this.options.position].unshift(this)
		this.stack()
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

	private insert() {
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
		const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`
		const textHtml =
			this.message instanceof HTMLElement
				? this.message.outerHTML
				: `<div class="space-y-1">${
						this.message?.title
							? `<p class="text-sm font-medium">${this.message?.title || ''}</p>`
							: ''
					}${
						this.message?.content
							? `<p class="text-sm text-muted-foreground">${this.message?.content || ''}</p>`
							: ''
					}</div>`
		container.innerHTML = `<div class="flex grow gap-3">${iconHtml}${textHtml}</div>`
		el.appendChild(container)

		// Add close button
		const button = document.createElement('button')
		button.className =
			'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:text-accent-foreground group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent'
		button.setAttribute('aria-label', 'Close notification')
		button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`
		button.addEventListener('click', () => {
			this.stopTimer()
			this.destroy()
		})
		container.appendChild(button)

		// Add gap
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
	async destroy() {
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

let i = 0
export function create() {
	i++
	return new Toast({ title: `[${i}]: Some information is missing!` })
}
