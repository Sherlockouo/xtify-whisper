import { useTranscribeStore } from "@/store/createStore";
import { TextItem } from "../../components/item";
import { useEffect, useState } from "react";
import { cx } from "@emotion/css";
import React from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const Containter = React.memo(() => {
  const useOpenFile = useTranscribeStore((state) => state.open_file);
  const navigate = useNavigate();
  const [p, setP] = useState<string[]>([]);

  useEffect(() => {
    setP(useOpenFile.text.split("\n\n").slice(1, -1));
  }, [useOpenFile]);

  return (
    <div className="h-full w-full flex flex-col">
      <h1
        className={cx(
          "text-lg",
          "backdrop-blur-lg z-10 sticky top-4 px-2 w-full flex justify-between bg-transparent "
        )}
      >
        {useOpenFile.file_name && useOpenFile.file_name}
        <div className="flex justify-center items-center border-solid border-[1px] rounded-md bg-slate-200">
          <CrossCircledIcon
            className="m-2 "
            onClick={() => {
              navigate(`/`);
            }}
          />
        </div>
      </h1>
      {useOpenFile.file_path !== "" ? (
        <div className="h-full w-full px-2 ">
          {p.length > 0 ? (
            <div className="h-full w-full">
              <AutoSizer className="selectable">
                {({ height, width }) => (
                  <List
                    className="List no-scrollbar"
                    height={height}
                    itemCount={p.length}
                    itemSize={60}
                    itemData={p}
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className=" text-[2em] font-bold whitespace-nowrap h-full w-full flex items-center justify-center">
              {
                useOpenFile.text !== "" ? "Audio is empty.":"You need transcribe first."
              }
            </div>
          )}
        </div>
      ) : (
        <div className="h-full w-full">
          <div className="h-full w-full flex items-center justify-center">
            {" "}
            Transcribe your audio into text in few minutes{" "}
          </div>
        </div>
      )}
    </div>
  );
});

const Row = ({ data, index, style }: ListChildComponentProps) => {
  return <TextItem text={data[index]} style={style} />;
};

export default Containter;
