import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { openMediaFile } from "@/utils/fs";
import { loadTranscription } from "@/utils/whisper";
import { create16bitWav, getDuration } from "@/utils/ffmpeg";
import { FileItem, FileItemBox } from "../item";
import { CrossCircledIcon, GearIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Database from "tauri-plugin-sql-api";
import Theme from "../theme/theme";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { MediaFile } from "@/utils/mediaFile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cx } from "@emotion/css";
import { useWhyDidYouUpdate } from "ahooks";

const SideBar = () => {
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FileItem[]>([]);
  const [mode, setMode] = useState(0);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();
  useWhyDidYouUpdate("sidebar", [
    searchKeyWord,
    total,
    page,
    items,
    mode,
    dragging,
    navigate,
  ]);
  const addToTranscribed = async (
    text: string,
    fileName: string,
    fileType: string,
    origin_file_path: string,
    filePath: string,
    duration: number,
    model: string
  ) => {
    const db = await Database.load("sqlite:transcribe.db");
    const exists = db.execute(
      "SELECT * FROM transcribed_files WHERE file_name  = ?",
      [fileName]
    );
    if ((exists as any).length > 0) {
      console.log("file already exists", exists);
      updateTranscribed(text, duration, (exists as any).id, model);
    }
    await db
      .execute(
        "INSERT into transcribed_files (text, file_name, file_type,origin_file_path , file_path, duration,model,create_timestamp,update_timestamp) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9)",
        [
          text,
          fileName,
          fileType,
          origin_file_path,
          filePath,
          duration,
          model,
          Date.now(),
          Date.now(),
        ]
      )
      .then(
        (v) => {
          getData();
          db.close();
        },
        (e) => {
          console.log("insert error", e);
          db.close();
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
      );
  };

  const search = async () => {
    const db = await Database.load("sqlite:transcribe.db");
    let result = await db.select(
      "SELECT * FROM transcribed_files WHERE file_name LIKE $1 OR file_type LIKE $1 OR file_path LIKE $1 OR text LIKE $1 ORDER BY id DESC LIMIT 20 OFFSET $2",
      ["%" + searchKeyWord + "%", 20 * (page - 1)]
    );
    console.log("result: ", result);

    setItems(result as FileItem[]);
  };

  const init = async () => {
    const db = await Database.load("sqlite:transcribe.db");
    await db.execute(
      "CREATE TABLE IF NOT EXISTS transcribed_files(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,file_name TEXT NOT NULL,file_type TEXT NOT NULL,origin_file_path TEXT NOT NULL,file_path TEXT NOT NULL, duration INTEGER NOT NULL,model TEXT NOT NULL, create_timestamp TIMESTAMP INTEGER NOT NULL ,update_timestamp INTEGER NOT NULL)"
    );
    const result = await db.select("SELECT COUNT(*) FROM transcribed_files");

    if ((result as any)[0] && (result as any)[0]["COUNT(*)"]) {
      setTotal((result as any)[0]["COUNT(*)"]);
    }
  };

  const getData = async () => {
    const db = await Database.load("sqlite:transcribe.db");
    let result = await db.select(
      "SELECT * FROM transcribed_files ORDER BY id DESC LIMIT 20 OFFSET $1",
      [20 * (page - 1)]
    );

    setItems(result as FileItem[]);
  };

  const updateTranscribed = async (
    text: string,
    duration: number,
    file_name: string,
    model: string
  ) => {
    const db = await Database.load("sqlite:transcribe.db");
    await db.execute(
      "UPDATE transcribed_files SET text=$1, duration=$2,model=$3 WHERE file_name=$4",
      [text, duration, model, file_name]
    );
    await getData();
  };

  const deleteTranscribed = async (id: number) => {
    const db = await Database.load("sqlite:transcribe.db");
    db.execute(" DELETE FROM transcribed_files where id = ?", [id]).then(() => {
      getData();
    });
  };
  const transcribe = async (file_name: string) => {
    const db = await Database.load("sqlite:transcribe.db");
    const item = await db.select(
      "select * FROM transcribed_files where file_name = $1",
      [file_name]
    );
    db.close();
    if (item && (item as any).length > 0) {
      const file = (item as FileItem[])[0];
      // todo add 状态
      const script = await loadTranscription(file.file_path);
      updateTranscribed(
        script.join("\n"),
        await getDuration(file.file_path),
        file_name,
        ""
      );
    }
  };

  useEffect(() => {
    init();
    getData();

    const unlistenHover = listen("tauri://file-drop-hover", (event) => {
      console.log(" ", dragging, "hover", event);
      setDragging(true);
    });

    const unlistenCancelled = listen("tauri://file-drop-cancelled", (event) => {
      console.log(" ", dragging, "cancelled", event);
      setDragging(false);
    });

    const unlistenDrop = listen("tauri://file-drop", (event) => {
      console.log(" ", dragging, "event ", event);

      setDragging(false);
      if (event.payload === undefined || (event.payload as any).length === 0)
        return;
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
        ].includes(((event.payload as any)[0] as string).split(".")[1])
      ) {
        for(let i = 0; i < (event.payload as any).length; i++){

          MediaFile.create((event.payload as any)[i]).then((file) => {
            addRecord(file);
          });
        }
      } else {
        console.log("file format error", event.payload);
      }
    });
    return () => {
      unlistenHover.then(fn => {
        fn();
      });
      unlistenCancelled.then(fn => {
        fn();
      });
      unlistenDrop.then(fn => {
        fn();
      });
    };
  }, []);

  useEffect(() => {
    getData();
  }, [total, page]);

  const dropRef = useRef<HTMLDivElement>(null);
  async function addRecord(file: MediaFile) {
    const item: FileItem = {
      text: "",
      file_name: file.fileName,
      file_type: file.extension,
      origin_file_path: file.originalPath,
      file_path: file.transformedPath,
      duration: 0,
      model: "ggml-base.en.bin",
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

  return (
    <div className="flex flex-col h-full w-full px-2 justify-between">
      <div className="h-full flex py-1 flex-col gap-2 ">
        {/* search */}
        <div className="flex flex-row flex-wrap w-full items-center space-x-2">
          <div className="relative">
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
                const file = await openMediaFile();

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
        <ScrollArea
          className={cx(
            " w-full h-3/4 rounded-md flex flex-col justify-between border-solid border-[1px] ",
            dragging ? "pointer-events-none" : "pointer-events-auto"
          )}
          ref={dropRef}
        >
          {dragging && (
            <div
              className={cx(
                " pointer-events-none absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-30 text-white flex justify-center items-center ",
                dragging ? "visible" : "invisible"
              )}
            >
              drop file to process
            </div>
          )}
          <div>
            {items.map((item) => (
              <FileItemBox
                key={item.id}
                item={item}
                delete={deleteTranscribed}
                retranscribe={transcribe}
              ></FileItemBox>
            ))}
          </div>
        </ScrollArea>

        {/* user & settings */}
        <div className=" h-1/8 rounded-md w-full flex items-center justify-between px-2 my-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 flex items-center justify-center rounded-md">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default SideBar;
