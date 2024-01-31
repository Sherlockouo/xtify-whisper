import { FileItem } from './../components/item';
import { create } from 'zustand'
import type { State, playing_file } from './initialState';
import { initialState } from './initialState';

interface Action {
  openFile: (item: FileItem) => void;
  addTranscribeFile: (file_id: number) => void
  delTranscribeFile: (file_id: number) => void
  updatePlaying: (playing: Partial<playing_file>) => void
  resetDB:()=>void
}
export type Store = State & Action;


export const useTranscribeStore = create<Store>((set, get) => ({
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
        vtt: `WEBVTT - ${item.file_name} \n\n` + item.text.split("\n\n").slice(1, -1).map((vtt: string) => {
          // 提取所有 [] 内的内容
          const matches = vtt.split("   ");
          // 提取时间戳，并去掉方括号
          const time = matches && matches.length > 0 ? matches[0].slice(1, -1) : "";
          
          // 提取剩余文本
          const audioText = matches && matches.length > 1 ? matches[1] : "";
          console.log("time: " + time + "\n" + "- " + audioText+"\n\n" );
          return time + "\n" + "- " + audioText+"\n\n" 
        }).join("")
      }
    })
  },
  addTranscribeFile: (file_id: number) => {
    let old_transcribe_file_ids = get().transcribe.transcribe_file_ids
    set({
      transcribe: {
        transcribe_file_ids: [...old_transcribe_file_ids, file_id],
      }
    })
  },
  delTranscribeFile: (file_id: number) => {
    let old_transcribe_file_ids = get().transcribe.transcribe_file_ids
    old_transcribe_file_ids.splice(old_transcribe_file_ids.indexOf(file_id), 1)
    set({
      transcribe: {
        transcribe_file_ids: old_transcribe_file_ids,
      }
    })
  },
  updatePlaying: (playing) => {
    set(state => ({
      playing_file: {
        ...state.playing_file,
        ...playing
      }
    }))
  },
  resetDB:()=>{
    set({
      db_reset: get().db_reset + 1
    })
  }
}))

