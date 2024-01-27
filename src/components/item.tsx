import { secondsToTimecode } from "@/utils/timecode";
import { Button } from "./ui/button";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PlayIcon,
  ReloadIcon,
  TrackNextIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useTranscribeStore } from "@/store/createStore";
import { useLocation, useNavigate } from "react-router-dom";
import { IoRefresh } from "react-icons/io5";
import { useTransCribe } from "@/hooks/useState";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FileItem {
  id?: number;
  text: string;
  file_name: string;
  file_path: string;
  file_type: string;
  origin_file_path: string;
  duration: number;
  model: string;
  create_time?: number;
  update_time?: number;
}

interface FileItemProps {
  item: FileItem;
  delete: (id: number) => void;
  retranscribe: (file_name: string) => void;
}

export const FileItemBox = ({
  item,
  delete: deleteFileItem,
  retranscribe: retranscribe,
}: FileItemProps) => {
  const { openFile, transcribeFile } = useTranscribeStore();
  const { transcribing, transcribe_file_id } = useTransCribe();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="px-2 mb-1 rounded-md border-[1px] border-solid border-slate-100 hover:bg-slate-200 flex items-center justify-between cursor-default">
      <div
        className="flex items-center"
        onClick={() => {
          openFile(item);
          console.log("location ", location.pathname);

          if (location.pathname !== "/") {
            navigate(`/`);
          }
        }}
      >
        <div className="px-1">
          {item.text == "" ? (
            transcribing && item.id === transcribe_file_id ? (
              <IoRefresh className=" animate-spin" />
            ) : (
              <CrossCircledIcon />
            )
          ) : (
            <CheckCircledIcon color="green" />
          )}
        </div>
        <div className="flex flex-col px-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {item.file_name.split(".")[0]}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.file_name.split(".")[0]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* hover i 展示 */}
          {/* <div className="max-w-[200px] text-wrap">{item.file_path}</div> */}
          <div className="max-w-[200px] text-wrap flex justify-between gap-3">
            <span>{item.file_type}</span>
            <span>{secondsToTimecode(Math.ceil(item.duration))}</span>
          </div>
        </div>
      </div>
      <div className="h-full flex gap-1">
        <Button
          size={"sm"}
          onClick={() => {
            // retranscribe
            retranscribe(item.file_name);
            // set icon to loading
            transcribeFile(true, item.id ?? 0);
          }}
        >
          {item.text === "" ? <PlayIcon /> : <ReloadIcon />}
        </Button>

        <Button
          size={"sm"}
          variant="destructive"
          onClick={() => deleteFileItem(item.id ?? 0)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
};

interface TextItemProps {
  text: string;
}

export const TextItem = ({ text }: TextItemProps) => {
  return (
    <div className="px-2 py-2 ">
      {""}
      {text}
      {""}
    </div>
  );
};

const Item = () => {
  return <></>;
};

export default Item;