import { formatBytes } from '@/lib/format-bytes.js';
import type { Asset } from './asset-gallery.js';

export function displayFileSize(asset: Asset) {
	return asset.fileSize ? formatBytes(asset.fileSize) : '—';
}

export function displayDimensions(asset: Asset) {
	return asset.width && asset.height ? `${asset.width} \u00d7 ${asset.height}` : '—';
}
