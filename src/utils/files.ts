import { readBinaryFile } from '@tauri-apps/api/fs';

export async function createAudioUrlFromFile(file_path: string) {
	const bin = await readBinaryFile(file_path);
	const blob = new Blob([bin], { type: 'audio/wav' });
	return window.URL.createObjectURL(blob);
}
