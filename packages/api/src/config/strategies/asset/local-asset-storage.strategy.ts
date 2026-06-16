import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import Stream from 'node:stream';
import { AssetStorageStrategy } from './asset-storage-strategy.interface';

export class LocalAssetStorageStrategy implements AssetStorageStrategy {
	constructor(private uploadDir = path.join(path.resolve('./public'), 'assets')) {}

	async saveFileFromStream(
		stream: Stream,
		fileInfo: {
			filename: string;
			mimetype: string;
		},
	): Promise<string> {
		await this.ensureAssetDirExists();
		const filePath = path.join(this.uploadDir, fileInfo.filename);
		const writeStream = fs.createWriteStream(filePath);
		await new Promise<void>((resolve, reject) => {
			stream.pipe(writeStream).on('finish', resolve).on('error', reject);
		});
		return filePath;
	}

	async saveFileFromBuffer(
		buffer: Buffer,
		fileInfo: {
			filename: string;
			mimetype: string;
		},
	): Promise<string> {
		await this.ensureAssetDirExists();
		const filePath = path.join(this.uploadDir, fileInfo.filename);
		await fsPromises.writeFile(filePath, buffer);
		return filePath;
	}

	async readFileToStream(identifier: string): Promise<Stream> {
		return fs.createReadStream(identifier);
	}

	async readFileToBuffer(identifier: string): Promise<Buffer> {
		return await fsPromises.readFile(identifier);
	}

	async deleteFile(identifier: string): Promise<void> {
		await fsPromises.unlink(identifier).catch(() => undefined);
	}

	async fileExists(filename: string): Promise<boolean> {
		try {
			await fsPromises.access(path.join(this.uploadDir, filename));
			return true;
		} catch {
			return false;
		}
	}

	toAbsoluteUrl(_request: Request, identifier: string): string {
		return identifier;
	}

	private async ensureAssetDirExists(): Promise<void> {
		await fsPromises.mkdir(this.uploadDir, {
			recursive: true,
		});
	}
}
