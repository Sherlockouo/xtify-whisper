export interface State {
    transcribe: {
        transcribe_file_ids: number[];
        
    }
    open_file: {
        id?: number;
        text: string;
        file_name: string;
        file_path: string;
        file_type: string;
        duration: number;
        create_time?: number;
        update_time?: number;
        vtt?:string
    }
    playing_file:{
        playing:boolean;
        currentTime:number;
    }

}

export interface playing_file  {
    playing:boolean;
    currentTime:number;
}

export const initialState: State = {
    transcribe:{
        transcribe_file_ids: [],
    },
    open_file:{
        text: "",
        file_name: "",
        file_path: "",
        file_type: "",
        duration: 0,
        vtt:"",
    },
    playing_file:{
        playing: false,
        currentTime: 0
    }
};