import type { AssetLike, ImageFormat, ImageMode, ImagePreset } from './image.js';

export const PRESET_SIZES = {
	tiny: {
		width: 50,
		height: 50,
	},
	thumb: {
		width: 150,
		height: 150,
	},
	small: {
		width: 300,
		height: 300,
	},
	medium: {
		width: 500,
		height: 500,
	},
	large: {
		width: 800,
		height: 800,
	},
	full: {
		width: undefined,
		height: undefined,
	},
} satisfies Record<
	Exclude<ImagePreset, null>,
	{
		width?: number;
		height?: number;
	}
>;

export function resolveSize(preset: ImagePreset, width?: number, height?: number) {
	if (preset) {
		return PRESET_SIZES[preset];
	}

	return {
		width: width ?? 100,
		height: height ?? 100,
	};
}

interface BuildImageUrlOptions {
	preset: ImagePreset;
	mode: ImageMode;
	format: ImageFormat;
	width?: number;
	height?: number;
	quality?: number;
	useFocalPoint: boolean;
}

export function buildImageUrl(asset: AssetLike, options: BuildImageUrlOptions): string {
	const url = new URL(asset.url);

	if (options.preset) {
		url.searchParams.set('preset', options.preset);
	} else {
		setSearchParams(url, {
			w: options.width,
			h: options.height,
			mode: options.mode,
		});
	}

	setSearchParams(url, {
		format: options.format,
		q: options.quality,
	});

	if (options.useFocalPoint && asset.focalPoint) {
		setSearchParams(url, {
			fpx: asset.focalPoint.x,
			fpy: asset.focalPoint.y,
		});
	}

	return url.href;
}

function setSearchParams(url: URL, params: Record<string, string | number | null | undefined>) {
	for (const [key, value] of Object.entries(params)) {
		if (value != null) {
			url.searchParams.set(key, String(value));
		}
	}
}
