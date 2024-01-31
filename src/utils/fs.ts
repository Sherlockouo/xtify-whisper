import { MediaFile } from '@/utils/mediaFile';
import { appCacheDir } from '@tauri-apps/api/path';
import { DialogFilter, open } from '@tauri-apps/api/dialog';
import { fs } from '@tauri-apps/api';

export const WAV_DIR = '16-bit-wav';
export const RECORDINGS_DIR = 'recordings';

export async function ensureWaveDir() {
	await fs.createDir(WAV_DIR, {
		dir: fs.BaseDirectory.AppCache,
		recursive: true
	});
}

export async function ensureRecordingDir() {
	await fs.createDir(RECORDINGS_DIR, {
		dir: fs.BaseDirectory.AppCache,
		recursive: true
	});
}

export async function getWaveDir() {
	return (await appCacheDir()) + WAV_DIR + '/';
}

export async function getRecordingsDir() {
	return (await appCacheDir()) + RECORDINGS_DIR + '/';
}

export const audio = {
	name: 'Media',
	extensions: ['wav', 'mp3', 'aif', 'mp4', 'aac', 'mov', 'wmv', 'avi', 'webm','mp4']
};

const model = {
	name: 'Model',
	extensions: ['bin']
};

const fileFilterMap:Record<string, DialogFilter> = {
		audioFilter: audio,
		modelFilter: model
}
export async function openFileWithFilter(filterType:string) {
	const opened = (await open({
		multiple: false,
		filters: [
			fileFilterMap[filterType]
		]
	})) as string | null;
    
	if (!opened) throw new Error(`Could not open file`);
	console.log("filterType",filterType === "audioFilter"," ",filterType);
	
	return MediaFile.create(opened,filterType === "audioFilter" ? "":filterType);
}