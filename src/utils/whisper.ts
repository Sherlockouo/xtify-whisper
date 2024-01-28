import { resolveResource } from '@tauri-apps/api/path';
import { Child, Command } from '@tauri-apps/api/shell';

/**
 * Runs the whisper model on a file and returns the output in vtt format
 * file_path: transformed file path
 */
// export async function loadTranscription(file_path:string): Promise<string[]> {
// 	const modelPath = await resolveResource('resources/models/ggml-base.en.bin');
	
// 	const transcribe = Command.sidecar('binaries/whisper', [
// 		'-m',
// 		modelPath,
// 		'-f',
// 		file_path
// 	]);

// 	const output: string[] = [];
// 	return new Promise(async (resolve, reject) => {
// 		transcribe.stderr.on('data', (error) => console.error(error));
// 		transcribe.stdout.on('data', (line) => {
// 			// Filter any empty lines
// 			if (line) output.push(line);
// 		});
// 		transcribe.on('error', reject);
// 		transcribe.on('close', () => resolve(output));
		
// 	let child = await  transcribe.spawn();
// 	});
// }

export async function loadTranscription(file_path: string,callback?:()=>void): Promise<{transcription: Promise<string[]>, child: Child}> {
    
    const modelPath = await resolveResource('resources/models/ggml-base.en.bin');

    const transcribe = Command.sidecar('binaries/whisper', [
        '-m',
        modelPath,
        '-f',
        file_path
    ]);

    const output: string[] = [];

    const transcriptionPromise = new Promise<string[]>((resolve, reject) => {
        transcribe.stderr.on('data', (error) => console.error(error));
        transcribe.stdout.on('data', (line) => {
            // Filter any empty lines
            if (line) output.push(line);
            // TODO: update progress here
            // console.log('line:', line);
            
        });
        transcribe.on('error', reject);
        transcribe.on('close', () => {
            callback && callback()
            resolve(output)
        });
    });

    const child = await transcribe.spawn();

    return { transcription: transcriptionPromise, child };
}
