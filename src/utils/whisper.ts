import { resolveResource } from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';

/**
 * Runs the whisper model on a file and returns the output in vtt format
 * file_path: transformed file path
 */
export async function loadTranscription(file_path:string): Promise<string[]> {
	const modelPath = await resolveResource('resources/models/ggml-base.en.bin');
	
	const transcribe = Command.sidecar('binaries/whisper', [
		'-m',
		modelPath,
		'-f',
		file_path
	]);
	
	const output: string[] = [];

	return new Promise((resolve, reject) => {
		transcribe.stderr.on('data', (error) => console.error(error));
		transcribe.stdout.on('data', (line) => {
			// Filter any empty lines
			if (line) output.push(line);
		});
		transcribe.on('error', reject);
		transcribe.on('close', () => resolve(output));
		transcribe.spawn();
	});
}
