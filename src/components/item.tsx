import { secondsToTimecode } from "@/utils/timecode";
import { Button } from "./ui/button";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PlayIcon,
  ReloadIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useTranscribeStore } from "@/store/createStore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import moment from "moment";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { findByFilename, updateByFilename } from "@/api/db-api/db-api";
import { loadTranscription } from "@/utils/whisper";
import { getDuration } from "@/utils/ffmpeg";
import { Child } from "@tauri-apps/api/shell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx } from "class-variance-authority";
import { useConfig } from "@/hooks/useConfig";
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
  className?: string;
  delete: (id: number) => void;
  style?: CSSProperties;
  updateCallback?: () => void;
  refresh: () => Promise<void>;
}

export const FileItemBox = ({
  className,
  item,
  style,
  delete: deleteFileItem,
  refresh,
}: FileItemProps) => {
  const { transcribeFileIds,getOpenFile, openFile, addTranscribeFile, delTranscribeFile } =
    useTranscribeStore(
      useShallow((state) => ({
        transcribeFileIds: state.transcribe.transcribe_file_ids,
        openFile: state.openFile,
        getOpenFile: state.open_file,
        addTranscribeFile: state.addTranscribeFile,
        delTranscribeFile: state.delTranscribeFile,
      }))
    );

  const [currentFileTranscribing, setCurrentFileTranscribing] = useState(false);
  const [abort, setAbort] = useState<Child>();
  const location = useLocation();
  const navigate = useNavigate();
  // read models from resources path
  const [models] = useConfig("model_path", []);
  const [defaultModelPath] = useConfig("default_model_path", "");
  const [currentModel, setCurrentModel] = useState(
    item.model === "" ? defaultModelPath : item.model
  );

  const transcribe = async (file_name: string) => {
    const localItem = await findByFilename(file_name);
    if (localItem && (localItem as any).length > 0) {
      const file = (localItem as FileItem[])[0];

      const { transcription, child } = await loadTranscription(
        file.file_path,
        file.duration,
        currentModel,
        () => {
          delTranscribeFile(file.id ?? 0);
        }
      );
      setAbort(child);

      const scripts = await transcription;

      await updateByFilename(
        scripts.join("\n"),
        (localItem as FileItem[])[0].duration,
        file_name,
        currentModel
      );

      // 删除 transcribing 状态
      delTranscribeFile(file.id ?? 0);
      setAbort(undefined);
      refresh();
    }
  };

  useEffect(() => {
    setCurrentFileTranscribing(transcribeFileIds.includes(item?.id ?? 0));
  }, [transcribeFileIds]);
  return (
    <div
      style={style}
      className={cx(
        className,
        getOpenFile.id === item.id && " bg-slate-200",
        " px-2  mb-1 rounded-md border-[1px] border-solid border-slate-100 hover:bg-slate-200 flex items-center justify-between cursor-default "
      )}
      onClick={async () => {
        await refresh();
        openFile(item);
        if (location.pathname !== "/content") {
          navigate(`/content`);
        }
      }}
    >
      <div className="flex items-center">
        <div className="px-1">
          {currentFileTranscribing ? (
            <ReloadIcon className="animate-spin" />
          ) : item.text === "" ? (
            <CrossCircledIcon />
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

          <Badge className="whitespace-nowrap ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {item.model.split("/").slice(-1)}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="">
                  <p>{item.model.split("/").slice(-1)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Badge>

          <div className="max-w-[200px] text-wrap flex justify-start gap-2">
            <span className="text-sm">{item.file_type}</span>
            <span className="text-sm">
              {secondsToTimecode(Math.ceil(item.duration))}
            </span>
          </div>
        </div>
      </div>
      <div
        className="h-full flex gap-1"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover>
          <PopoverTrigger>
            <div className="h-8  w-10 rounded-md bg-green-400 flex items-center justify-center">
              <UpdateIcon />
            </div>
          </PopoverTrigger>
          <PopoverContent side={"top"} className="w-15">
            <div className="flex gap-2 w-full justify-center items-center">
              <Select
                onValueChange={(value) => {
                  setCurrentModel(value);
                }}
                defaultValue={defaultModelPath}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {models &&
                    models.map((modelname: string) => (
                      <SelectItem key={modelname} value={modelname}>
                        {modelname}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {abort && (
                <Button
                  size={"sm"}
                  variant={"destructive"}
                  onClick={() => {
                    abort.kill();
                    setAbort(undefined);
                    // delete file id
                    delTranscribeFile(item.id ?? 0);
                    // update current item
                    setCurrentFileTranscribing(false);
                    toast.info("Aborted " + item.file_name);
                  }}
                >
                  Abort
                </Button>
              )}
              <Button
                disabled={currentFileTranscribing}
                className={cx(
                  item.text === "" ? "bg-green-500" : " bg-amber-500"
                )}
                size={"sm"}
                onClick={async () => {
                  if (currentModel === "") {
                    toast.warning("Please select a model.");
                    return;
                  }
                  setCurrentFileTranscribing(true);
                  // set icon to loading
                  addTranscribeFile(item.id ?? 0);
                  // set current item
                  toast.info("Transcribing " + item.file_name);

                  // retranscribe
                  transcribe(item.file_name);
                  setCurrentFileTranscribing(false);
                }}
              >
                {item.text === "" ? (
                  <div className="flex gap-1">
                    <PlayIcon />
                    Transcribe
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <ReloadIcon /> Retranscribe
                  </div>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
  style: CSSProperties;
}

export const TextItem = ({ text, style }: TextItemProps) => {
  const { updatePlaying } = useTranscribeStore(
    useShallow((state) => ({ updatePlaying: state.updatePlaying }))
  );
  // 提取所有 [] 内的内容
  const matches = text.split("   ");
  // 提取时间戳，并去掉方括号
  const time = matches && matches.length > 0 ? matches[0].slice(1, -1) : "";
  // 提取剩余文本
  const audioText = matches && matches.length > 1 ? matches[1] : "";
  return (
    <div className="px-2 py-2 flex gap-2 items-center" style={style}>
      <div className="flex select-none cursor-default">
        <Button
          className="w-[247px] select-none cursor-default"
          onClick={() => {
            const seconds = moment.duration(time.split(" --> ")[0]).asSeconds();
            updatePlaying({
              currentTime: seconds,
              playing: true,
            });
          }}
        >
          {time}
        </Button>
      </div>
      <div className=" flex text-lg flex-wrap ">{audioText}</div>
    </div>
  );
};

const Item = () => {
  return <></>;
};

export default Item;
