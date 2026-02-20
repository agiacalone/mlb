import type { Attachment } from 'svelte/attachments'

export function intersectionObserver(
	callback: (entry: IntersectionObserverEntry) => void,
	options: IntersectionObserverInit = {},
): Attachment {
	return (element) => {
		let observer: IntersectionObserver | null = null

		observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				callback(entry)
			}
		}, options)

		observer.observe(element)

		return () => {
			observer.disconnect()
		}
	}
}
