import { resolveResource } from '@tauri-apps/api/path';
import { Child, Command } from '@tauri-apps/api/shell';
import moment from 'moment';
import { toast } from 'sonner';
import { debounce } from './debounce';

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

const debouncedProcessToast = debounce((line:string,duration:number)=>{
        const matches = line.split("   ");
                // 提取时间戳，并去掉方括号
                const time = matches && matches.length > 0 ? matches[0].slice(1, -1) : "";;
                const seconds = moment.duration(time.split(" --> ")[0]).asSeconds();
                toast.info("Process " + Math.ceil(seconds / duration * 100) + "%")
    },800)


export async function loadTranscription(file_path: string, duration: number, modelPath: string, callback?: () => void): Promise<{ transcription: Promise<string[]>, child: Child }> {
    if (!modelPath || modelPath === "") {
        modelPath = await resolveResource('resources/models/ggml-base.en.bin');
        console.log('Fallback to default model' + modelPath);
    }

    const transcribe = Command.sidecar('binaries/whisper', [
        '-m',
        modelPath,
        '-f',
        file_path
    ]);

    const output: string[] = [];
    
    
    const transcriptionPromise = new Promise<string[]>((resolve, reject) => {
        transcribe.stderr.on('data', (error) => {
            console.error(error.message);
        });
        transcribe.stdout.on('data', (line) => {
            // Filter any empty lines
            if (line) {
                output.push(line);
                // TODO: update progress here
                // console.log('line:', line)
                debouncedProcessToast(line,duration)
            }

        });
        transcribe.on('error', (e) => {
            toast.error("Error " + e)
            reject();
        });
        transcribe.on('close', () => {
            callback && callback()
            toast.success("Process 100%")
            resolve(output)
        });
    });

    const child = await transcribe.spawn();

    return { transcription: transcriptionPromise, child };
}

