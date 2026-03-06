export function formatDateTime(value: string) {
	const date = new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function formatNumber(value: number) {
	return new Intl.NumberFormat("en-US").format(value);
}
