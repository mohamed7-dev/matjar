const UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const;

export function formatBytes(bytes: number, decimals = 2): string {
	if (!Number.isFinite(bytes) || bytes < 0) {
		throw new Error('Bytes must be a non-negative finite number');
	}

	if (bytes === 0) {
		return '0 Bytes';
	}

	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		UNITS.length - 1,
	);

	const value = bytes / 1024 ** unitIndex;
	const formatted =
		unitIndex === 0
			? value.toString()
			: value.toFixed(decimals).replace(/\.?0+$/, '');

	return `${formatted} ${UNITS[unitIndex]}`;
}