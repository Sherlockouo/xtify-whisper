import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { openFileWithFilter } from "@/utils/fs";
import { create16bitWav, getDuration } from "@/utils/ffmpeg";
import { FileItem, FileItemBox } from "../item";
import {
  ArrowDownIcon,
  BoxIcon,
  CrossCircledIcon,
  GearIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Theme from "../theme/theme";
import { listen } from "@tauri-apps/api/event";
import { MediaFile } from "@/utils/mediaFile";
import { useNavigate } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { toast } from "sonner";
import {
  addTranscribeFile,
  deleteByID,
  findByFilename,
  getDataByPage,
  getTotal,
  initDatabase,
  searchByKeyword,
  updateByFilename,
} from "@/api/db-api/db-api";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { useTranscribeStore } from "@/store/createStore";
import { VERSION } from "@/utils/env";
import { useConfig } from "@/hooks/useConfig";

const SideBar = () => {
  const {transcribingIDS} = useTranscribeStore((state)=>({transcribingIDS: state.transcribe.transcribe_file_ids}))
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [total, setTotal] = useState(0);
  const [page] = useState(1);
  const [items, setItems] = useState<FileItem[]>([]);
  const [mode, setMode] = useState(0);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();
  const { openedFile, openFile } = useTranscribeStore((state) => ({
    openedFile: state.open_file,
    openFile: state.openFile,
  }));
  const [builtInModelPath] = useConfig("built_in_model_path", "empty");
  const [defaultModelPath] = useConfig("default_model_path", "");

  const addToTranscribed = async (
    text: string,
    fileName: string,
    fileType: string,
    origin_file_path: string,
    filePath: string,
    duration: number,
    model: string
  ) => {
    const exists = await findByFilename(fileName);
    if ((exists as any).length > 0) {
      toast.warning("File already exists: " + fileName);
      await updateTranscribed(text, duration, (exists as any).id, model);
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
    if ((res as any).rowsAffected > 1) {
      getData();
    } else {
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

  const search = async () => {
    const result = await searchByKeyword(searchKeyWord, page);
    setItems(result as FileItem[]);
  };

  const init = async () => {
    await initDatabase();
    const total = await getTotal();
    console.log("total: ", total);
    // TODO: extract the total
    if ((total as any)[0] && (total as any)[0]["COUNT(*)"]) {
      setTotal((total as any)[0]["COUNT(*)"]);
      console.log(total);
    }
  };

  const getData = async () => {
    const result = await getDataByPage(page);

    setItems(result as FileItem[]);
  };

  const updateTranscribed = async (
    text: string,
    duration: number,
    file_name: string,
    model: string
  ) => {
    await updateByFilename(text, duration, file_name, model);
    await getData();
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

  useEffect(() => {
    init();
    getData();

    const unlistenHover = listen("tauri://file-drop-hover", (event) => {
      setDragging(true);
    });

    const unlistenCancelled = listen("tauri://file-drop-cancelled", (event) => {
      setDragging(false);
    });

    const unlistenDrop = listen("tauri://file-drop", (event) => {
      setDragging(false);
      if (event.payload === undefined || (event.payload as any).length === 0)
        return;

      for (let i = 0; i < (event.payload as any).length; i++) {
        if (
          [
            "wav",
            "mp3",
            "aif",
            "mp4",
            "aac",
            "mov",
            "wmv",
            "avi",
            "webm",
          ].includes(
            ((event.payload as any)[i] as string).split(".").slice(-1)[0]
          )
        ) {
          MediaFile.create((event.payload as any)[i], "").then((file) => {
            addRecord(file);
          });
          toast.success("Add file successfully, now you can process it.");
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
  }, [total, page,transcribingIDS,openedFile]);


  async function addRecord(file: MediaFile) {
    const exists = await findByFilename(file.fileName);

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
      duration: await getDuration(file.path),
      model: builtInModelPath?builtInModelPath:"",
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

  // TODO: 分页
  // const loadMoreItems = (startIndex, stopIndex) => {
  //   await getDataByPage(page+1)
  // }

  const Row = ({ data, index, style }: ListChildComponentProps) => {
    return (
      <div className="" style={style}>
        <FileItemBox item={data[index]} delete={deleteTranscribed} refresh={()=>{
          return getData();
        }}/>
      </div>
    );
  };

  return (
    <div
      className={cx(
        "grid h-full w-full ",
        css`
          grid-template-rows: 1fr 1.5fr 10fr 1fr;
          grid-template-areas:
            "side-head"
            "side-search"
            "side-main"
            "side-foot";
        `
      )}
    >
      <div
        data-tauri-drag-region
        className={cx(
          "bg-blue-200 py-2 h-[3em] w-full flex justify-center ",
          css`
            grid-area: side-head;
          `
        )}
      >
        <h2>
          {""} Logo {""}
        </h2>
      </div>
      {/* search */}
      <div
        className={cx(
          "flex flex-row flex-wrap w-full items-center space-x-2 ",
          css`
            grid-area: side-search;
          `
        )}
      >
        <div className="relative px-2">
          <Input
            type="text"
            placeholder="Search File "
            value={searchKeyWord}
            onChange={(e) => {
              setSearchKeyWord(e.target.value);
            }}
            className="w-[180px]"
          />
          {searchKeyWord !== "" && (
            <CrossCircledIcon
              className="absolute translate-x-40 -translate-y-6"
              onClick={() => {
                setSearchKeyWord("");
                if (mode === 1) {
                  setMode(0);
                  getData();
                }
              }}
            />
          )}
        </div>
        <Button
          size={"sm"}
          type="button"
          onClick={async () => {
            if (searchKeyWord === "") {
              // add file to waitlist
              const file = await openFileWithFilter("audioFilter");

              await addRecord(file);
            } else {
              search();
              setMode(1);
            }
          }}
        >
          {searchKeyWord === "" ? "Add" : "Search"}
        </Button>
      </div>
      {/* file list  */}
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
                <List
                  className="List no-scrollbar"
                  height={height}
                  itemCount={items.length}
                  itemSize={70}
                  itemData={items}
                  width={width}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          ) : (
            <div className=" grid place-items-center">
              {mode === 1 ? (
                <span className="font-mono">No such Record </span>
              ) : (
                <span>
                  drag audio file here or click the add button to transcribe
                  audio file to text
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* user & settings */}

      {/* </div> */}
      <div
        className={cx(
          "rounded-md w-full  flex  flex-col gap-1 items-center justify-between px-2 ",
          css`
            grid-area: side-foot;
          `
        )}
      >
        <div className=" flex items-center gap-2">
          {/* <div className="h-7 w-7 flex items-center justify-center rounded-md">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
          </div> */}
          <div
            className="h-7 w-7 hover:bg-slate-200 flex items-center justify-center rounded-md"
            onClick={() => {
              navigate(`/settings`);
            }}
          >
            <GearIcon className="h-6 w-6" />
          </div>
          <div>
            <Theme />
          </div>
        </div>
        {/* TODO: click show update info modal */}
        <div className="flex items-center gap-1 ">
          <InfoCircledIcon />
          <div className="text-center text-sm font-thin">
            {""} {VERSION} {""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
