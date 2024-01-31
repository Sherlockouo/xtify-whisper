import { addTranscribeFile, findByFilePath, updateByFilename } from "@/api/db-api/db-api";
import { FileItem } from "@/components/item";
import { create16bitWav, getDuration } from "@/utils/ffmpeg";
import { MediaFile } from "@/utils/mediaFile";
import { toast } from "sonner";

export const addToTranscribed = async (
  text: string,
  fileName: string,
  fileType: string,
  origin_file_path: string,
  filePath: string,
  duration: number,
  model: string
) => {
  const exists = await findByFilePath(origin_file_path);
  if ((exists as any).length > 0) {
    toast.warning("File already exists: " + fileName);
    await updateByFilename(text, duration, (exists as any).id, model,(exists as any).transcribe_times);
    return;
  }
  const res = await addTranscribeFile(
    text,
    fileName,
    fileType,
    origin_file_path,
    filePath,
    duration,
    model
  );
  //   redo˝
  if ((res as any).rowsAffected < 1) {
    addToTranscribed(
      text,
      fileName,
      fileType,
      origin_file_path,
      filePath,
      duration,
      model
    );
  }
};

export const addRecord = async (file: MediaFile,builtInModelPath?:string) =>{
    const exists = await findByFilePath(file.originalPath);

    if ((exists as any).length > 0) {
      toast.warning("File already exists: " + file.fileName);
      return;
    }
    const item: FileItem = {
      text: "",
      file_name: file.fileName,
      file_type: file.extension,
      origin_file_path: file.originalPath,
      file_path: file.transformedPath,
      duration: await getDuration(file.originalPath),
      model: builtInModelPath ? builtInModelPath : "",
    };
    await addToTranscribed(
      "",
      item.file_name,
      item.file_type,
      item.origin_file_path,
      item.file_path,
      item.duration,
      item.model
    );
    await create16bitWav(file);
  }