import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import Stream from 'node:stream';
import { Injector } from '../../../common/helpers/injector';
import { AssetStorageStrategy } from './asset-storage-strategy.interface';

export class LocalAssetStorageStrategy implements AssetStorageStrategy {
	private configService: import('../../config.service').ConfigService;
	constructor(private uploadDir = path.join(path.resolve('./public'), 'assets')) {}

	async onInit(injector: Injector): Promise<void> {
		const { ConfigService } = await import('../../config.service.js');
		this.configService = injector.get(ConfigService);
	}

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
		const baseUrl = `http://${this.configService.api.host}:${this.configService.api.port}`;
		return `${baseUrl}/assets/${fileInfo.filename}`;
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
		const baseUrl = `http://${this.configService.api.host}:${this.configService.api.port}`;
		return `${baseUrl}/assets/${fileInfo.filename}`;
	}

	async readFileToStream(identifier: string): Promise<Stream> {
		return fs.createReadStream(this.buildAbsolutePathFromUrl(identifier));
	}

	async readFileToBuffer(identifier: string): Promise<Buffer> {
		return await fsPromises.readFile(this.buildAbsolutePathFromUrl(identifier));
	}

	async deleteFile(identifier: string): Promise<void> {
		await fsPromises.unlink(this.buildAbsolutePathFromUrl(identifier)).catch(() => undefined);
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
		return this.buildAbsolutePathFromUrl(identifier);
	}

	private async ensureAssetDirExists(): Promise<void> {
		await fsPromises.mkdir(this.uploadDir, {
			recursive: true,
		});
	}

	private buildAbsolutePathFromUrl(url: string): string {
		const fileName = url.split('/').at(-1);

		if (fileName) {
			return `${path.join(this.uploadDir, fileName)}`;
		}
		return url;
	}
}
