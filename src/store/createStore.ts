import { FileItem } from './../components/item';
import { create } from 'zustand'
import type { State } from './initialState';
import { initialState } from './initialState';

interface Action {
  openFile:  (item: FileItem) => void;
  transcribeFile: (transcribing: boolean, file_id: number)=> void
}
export type Store = State & Action;


export const useTranscribeStore = create<Store>((set) => ({
  ...initialState,

  openFile: (item: FileItem) => {
    set({
      open_file: {
        id: item.id,
        text: item.text,
        file_name: item.file_name,
        file_path: item.file_path,
        file_type: item.file_type,
        duration: item.duration,
        create_time: item.create_time,
        update_time: item.update_time,
      }
    })
  },
  transcribeFile: (transcribing: boolean, file_id: number) => {
    set({

      transcribe: {
        transcribe_file_id: file_id,
        transcribing: transcribing
      }
    })
  }
}))

