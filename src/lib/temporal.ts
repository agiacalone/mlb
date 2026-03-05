export function getToday(timeZone: string = 'America/Los_Angeles') {
	const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
	return new Date(dateStr.replace(/-/g, '/'))
}

/** Converts YYYY-MM-DD to YYYY/MM/DD to avoid UTC parsing issues */
export function slash(date?: string) {
	return date?.replace(/-/g, '/') ?? ''
}

export function formatDate(
	date: Date | string,
	options: Intl.DateTimeFormatOptions & { locale?: string } = { locale: 'en-US' },
) {
	return new Intl.DateTimeFormat(options.locale, options).format(
		typeof date === 'string' ? new Date(date.includes('T') ? date : slash(date)) : date,
	)
}

export function formatWeekRange(date: string) {
	const t = new Date(date)
	const startDate = new Date(t.setDate(t.getDate() - ((t.getDay() + 6) % 7)))
	const endDate = new Date(t.setDate(t.getDate() + (6 - ((t.getDay() + 6) % 7))))
	const isSameMonth = startDate.getMonth() === endDate.getMonth()

	return [
		formatDate(startDate, { month: 'short', day: 'numeric' }),
		formatDate(endDate, isSameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' }),
	].join(' - ')
}
