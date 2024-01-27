import { createAudioUrlFromFile } from "./files";
import { MediaFile } from "./mediaFile";

export const createAudioBlobUrl = async (file_path: string) => {
    // if (file.blobUrl) return;
    const blobUrl = await createAudioUrlFromFile(file_path);
    return blobUrl;
}