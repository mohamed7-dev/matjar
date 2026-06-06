import path from 'node:path';
import { normalizeString } from '@matjar/common/lib/shared-utils';
import { RequestContext } from '../../../api/request-context/request-context';
import { AssetNamingStrategy } from './asset-naming-strategy.interface';

export class DefaultAssetNamingStrategy implements AssetNamingStrategy {
	private static readonly IMAGE_EXTENSIONS = new Set([
		'.jpg',
		'.jpeg',
		'.png',
		'.webp',
		'.tiff',
		'.avif',
		'.gif',
	]);

	private readonly conflictSuffixRe = /__(\d+)(\.[^.]+)?$/;

	createSourceName(_ctx: RequestContext, originalName: string, conflictName?: string): string {
		const fileName = normalizeString(originalName, '-');

		return conflictName ? this.bumpConflictSuffix(fileName, conflictName) : fileName;
	}

	createPreviewName(_ctx: RequestContext, sourceName: string, conflictName?: string): string {
		const previewName = this.buildPreviewName(sourceName);

		return conflictName ? this.bumpConflictSuffix(previewName, conflictName) : previewName;
	}

	private buildPreviewName(fileName: string): string {
		const previewName = this.appendSuffix(fileName, '__preview');

		return this.supportsExtension(fileName) ? previewName : `${previewName}.png`;
	}

	private supportsExtension(fileName: string): boolean {
		return DefaultAssetNamingStrategy.IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
	}

	private bumpConflictSuffix(baseName: string, conflictName: string): string {
		const current = Number(conflictName.match(this.conflictSuffixRe)?.[1]) || 1;

		return this.addConflictSuffix(baseName, current + 1);
	}

	private addConflictSuffix(fileName: string, index: number): string {
		return this.appendSuffix(fileName, `__${String(index).padStart(2, '0')}`);
	}

	private appendSuffix(fileName: string, suffix: string): string {
		const ext = path.extname(fileName);
		const name = path.basename(fileName, ext);

		return `${name}${suffix}${ext}`;
	}
}
