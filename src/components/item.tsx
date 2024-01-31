import { secondsToTimecode } from "@/utils/timecode";
import { Button } from "./ui/button";
import {
  ArrowDownIcon,
  BoxIcon,
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
import { loadTranscription } from "@/utils/whisper";
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
import { useConfig } from "@/hooks/useConfig";

import { create16bitWav, getDuration } from "@/utils/ffmpeg";
import { listen } from "@tauri-apps/api/event";
import { MediaFile } from "@/utils/mediaFile";
import { css, cx } from "@emotion/css";
import {
  deleteByID,
  findByFileID,
  findByFilePath,
  getDataByPage,
  getTotal,
  initDatabase,
  searchByKeyword,
  updateByFilename,
} from "@/api/db-api/db-api";

// infinite scroll
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { addToTranscribed } from "@/services/filerecordservice";
import { audio } from "@/utils/fs";

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
  transcribe_times?: number;
}

interface FileItemProps {
  item: FileItem;
  className?: string;
  delete: (id: number) => void;
  style?: CSSProperties;
  updateCallback?: (id: number) => Promise<void>;
}

export const FileItemBox = ({
  className,
  item,
  style,
  delete: deleteFileItem,
  updateCallback,
}: FileItemProps) => {
  const {
    transcribeFileIds,
    getOpenFile,
    openFile,
    addTranscribeFile,
    delTranscribeFile,
  } = useTranscribeStore(
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
  const [builtInModelPath] = useConfig("built_in_model_path", "empty");
  const [currentModel, setCurrentModel] = useState<string>();

  const transcribe = async (origin_file_path: string) => {
    const localItem = await findByFilePath(origin_file_path);
    if (localItem && (localItem as any).length > 0) {
      const file = (localItem as FileItem[])[0];

      const { transcription, child } = await loadTranscription(
        file.file_path,
        file.duration,
        currentModel ?? builtInModelPath,
        () => {
          delTranscribeFile(file.id ?? 0);
        }
      );
      setAbort(child);

      const scripts = await transcription;

      await updateByFilename(
        scripts.join("\n"),
        (localItem as FileItem[])[0].duration,
        file.file_name,
        currentModel ?? builtInModelPath,
        file.transcribe_times ?? 1,
      );
      await updateCallback?.(file.id ?? 0);
      // 删除 transcribing 状态
      delTranscribeFile(file.id ?? 0);
      setAbort(undefined);
    }
  };

  useEffect(() => {
    setCurrentModel(item.model);
  }, []);

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
          ) : !item.transcribe_times || item.transcribe_times < 1 ? (
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
                defaultValue={currentModel}
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
                  transcribe(item.origin_file_path);
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

export interface FileItemListProps {
  searchKeyWord: string;
}

export const FileItemList = ({ searchKeyWord }: FileItemListProps) => {
  const { transcribingIDS } = useTranscribeStore((state) => ({
    transcribingIDS: state.transcribe.transcribe_file_ids,
  }));

  const [total, setTotal] = useState(0);
  const [page] = useState(1);
  const [items, setItems] = useState<FileItem[]>([]);

  const [dragging, setDragging] = useState(false);
  const { openedFile, openFile, dbRst } = useTranscribeStore((state) => ({
    openedFile: state.open_file,
    openFile: state.openFile,
    dbRst: state.db_reset,
  }));
  const [builtInModelPath] = useConfig("built_in_model_path", "empty");

  useEffect(() => {
    const search = async () => {
      const result = await searchByKeyword(searchKeyWord, page);
      setItems(result as FileItem[]);
    };
    searchKeyWord && search();
  });

  const init = async () => {
    await initDatabase();
    const total = await getTotal();
    if ((total as any)[0] && (total as any)[0]["COUNT(*)"]) {
      setTotal((total as any)[0]["COUNT(*)"]);
    }
  };

  const getData = async () => {
    const result = await getDataByPage(page);

    setItems(result as FileItem[]);
  };

  const updateTranscribed = async (id: number) => {
    // TODO: 替换 list 中的值 而不是整个列表渲染
    const updatedItem = ((await findByFileID(id)) as FileItem[])[0];
    console.log("updated item ", updatedItem);

    items[items.findIndex((item) => item.id === updatedItem.id)] = updatedItem;
    setItems(items);
  };

  const deleteTranscribed = async (id: number) => {
    await deleteByID(id);
    if (openedFile.id === id) {
      openFile({
        text: "",
        file_name: "",
        file_path: "",
        file_type: "",
        origin_file_path: "",
        duration: 0,
        model: "",
      });
    }
    toast.success("Delete Success.");
    getData();
  };

  const Row = ({ data, index, style }: ListChildComponentProps) => {
    return (
      <div className="" style={style}>
        <FileItemBox
          item={data[index]}
          delete={deleteTranscribed}
          updateCallback={updateTranscribed}
        />
      </div>
    );
  };
  useEffect(() => {
    init();
    getData();

    const unlistenHover = listen("tauri://file-drop-hover", () => {
      setDragging(true);
    });

    const unlistenCancelled = listen("tauri://file-drop-cancelled", () => {
      setDragging(false);
    });

    const unlistenDrop = listen("tauri://file-drop", (event) => {
      setDragging(false);
      if (event.payload === undefined || (event.payload as any).length === 0)
        return;

      for (let i = 0; i < (event.payload as any).length; i++) {
        if (
         audio.extensions.includes(
            ((event.payload as any)[i] as string).split(".").slice(-1)[0]
          )
        ) {
          MediaFile.create((event.payload as any)[i], "").then((file) => {
            addRecord(file);
          });
          // toast.success("Add file successfully, now you can process it.");
        } else {
          toast.error("File format not supported");
        }
      }
    });
    return () => {
      unlistenHover.then((fn) => {
        fn();
      });
      unlistenCancelled.then((fn) => {
        fn();
      });
      unlistenDrop.then((fn) => {
        fn();
      });
    };
  }, []);

  useEffect(() => {
    getData();
    console.log(' db rst ',dbRst);
    
  }, [total, page, transcribingIDS, dbRst]);

  async function addRecord(file: MediaFile) {
    const exists = await findByFilePath(file.originalPath);
    console.log(' file ', file, ' ', file.path);

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
    getData();
    await create16bitWav(file);
  }

  const isItemLoaded = (index: number) => {
    return !!items[index];
  };

  const loadMoreItems = (_startIndex: number, _stopIndex: number) => {
    getDataByPage(page + 1).then((data) => {
      setItems([...items, ...(data as FileItem[])]);
    });
  };

  return (
    <div
      className={cx(
        "relative overflow-scroll-y no-scrollbar rounded-md flex flex-col justify-between border-solid border-[1px] msx-2",
        dragging ? "pointer-events-none" : "pointer-events-auto",
        css`
          grid-area: side-main;
        `
      )}
    >
      {dragging && (
        <div
          className={cx(
            "z-10 pointer-events-none absolute top-0 bottom-0 left-0 right-0",
            "  flex justify-center items-center flex-col",
            " bg-opacity-70  backdrop-blur-lg",
            dragging ? "visible" : "invisible"
          )}
        >
          <ArrowDownIcon className="h-16 w-10  animate-bounce" />
          <BoxIcon className="relative h-10 w-10 -top-10" />
          drop file to process
        </div>
      )}
      <div className="h-full">
        {items.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={total}
                loadMoreItems={loadMoreItems}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    className="List no-scrollbar"
                    height={height}
                    itemCount={items.length}
                    itemSize={70}
                    itemData={items}
                    width={width}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                  >
                    {Row}
                  </List>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        ) : (
          <div className=" grid place-items-center">
            {searchKeyWord !== "" ? (
              <span className="font-mono">No such Record </span>
            ) : (
              <span>
                drag audio file here or click the add button to transcribe audio
                file to text
              </span>
            )}
          </div>
        )}
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
      <div className=" flex text-lg flex-wrap">{audioText}</div>
    </div>
  );
};

const Item = () => {
  return <></>;
};

export default Item;
