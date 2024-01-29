import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { openFileWithFilter } from "@/utils/fs";
import { FileItemList } from "../item";
import {
  CrossCircledIcon,
  GearIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Theme from "../theme/theme";
import { css, cx } from "@emotion/css";
import { VERSION } from "@/utils/env";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/hooks/useConfig";
import { addRecord } from "@/services/filerecordservice";

const SideBar = () => {
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const navigate = useNavigate();
  const [builtInModelPath] = useConfig("built_in_model_path", "empty");


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
          "py-2 h-[3em] w-full flex justify-center ",
          css`
            grid-area: side-head;
          `
        )}
      >
        <h2>
          {""} {""}
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
                setSearchKey("")
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

              await addRecord(file,builtInModelPath);
            } else {
              setSearchKey(searchKeyWord)
            }
          }}
        >
          {searchKeyWord === "" ? "Add" : "Search"}
        </Button>
      </div>
      <FileItemList searchKeyWord={searchKey} />

      {/* user & settings */}

      {/* </div> */}
      <div
        className={cx(
          "rounded-md w-full my-2 flex  flex-col gap-1 items-center justify-between px-2 ",
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
