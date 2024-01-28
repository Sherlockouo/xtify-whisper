import { getWaveDir } from '@/utils/fs';

export class MediaFile {
	url: URL;
	readonly transformedPath: string;
	blobUrl: string | null = null;
	originalPath: string;

	constructor(path: string, transformedPathDir: string,fileType?: string) {
		this.originalPath = path;
		this.url = new URL('file://' + path);
		if(fileType != ""){
			// not support
			this.transformedPath = ""
			return;
		}
		this.transformedPath = transformedPathDir + this.name + '-tmp.wav';
	}

	get name() {
		return this.fileName.split(".").slice(0,-1).join("");
	}

	get extension() {
		const pathname = this.url.pathname;
		return pathname.substring(pathname.lastIndexOf('.'));
	}

	get fileName() {
		const pathname = this.url.pathname;
		return decodeURI(pathname.substring(pathname.lastIndexOf('/') + 1));
	}

	get path() {
		return decodeURI(this.url.pathname);
	}

	static async create(path: string,fileType?: string) {
		const waveDir = await getWaveDir();
		return new MediaFile(path, waveDir,fileType);
	}
}
