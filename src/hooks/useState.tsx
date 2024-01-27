import {useTranscribeStore} from '@/store/createStore';
// import {shallow} from "zustand/shallow";

export const useOpenFile = () => useTranscribeStore((state) => state.open_file)
export const useTransCribe = () => useTranscribeStore((state) => state.transcribe)
