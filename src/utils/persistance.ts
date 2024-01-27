import { fs } from '@tauri-apps/api';
import { appCacheDir } from '@tauri-apps/api/path';

const SAVE_FILE = 'save-data.json';

export async function save(transcripts: Transcript[]) {
	const data = JSON.stringify(transcripts);
	const cacheDir = await appCacheDir();
	return fs.writeTextFile(cacheDir + SAVE_FILE, data);
}

export async function loadFromCache() {
	// const cacheDir = await appCacheDir();
}
