export interface State {
    transcribe: {
        transcribe_file_id: number;
        transcribing: boolean;
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
    }

}

export const initialState: State = {
    transcribe:{
        transcribe_file_id: 0,
        transcribing: false
    },
    open_file:{
        text: "",
        file_name: "",
        file_path: "",
        file_type: "",
        duration: 0
    }
};