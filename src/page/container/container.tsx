import { useTranscribeStore } from "@/store/createStore";
import { TextItem } from "../../components/item";
import { useEffect, useState } from "react";
import { cx } from "@emotion/css";
import React from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Containter = React.memo(() => {
  const useOpenFile = useTranscribeStore((state) => state.open_file);

  const [p, setP] = useState<string[]>([]);

  useEffect(() => {
    console.log(' containter ',useOpenFile.text);
    setP(useOpenFile.text.split("\n\n").slice(1, -1));
    
  }, [useOpenFile]);

  return (
    <div className="h-full w-full flex flex-col">
      <h1
        className={cx(
          "text-lg",
          "backdrop-blur-lg z-10 sticky top-4 w-full flex justify-center bg-transparent"
        )}
      >
        {useOpenFile.file_name && useOpenFile.file_name}
      </h1>
      {useOpenFile.file_path !== "" ? (
        <div className="h-full w-full px-2">
          {useOpenFile.text !== "" ? (
            <div className="h-full w-full">
              <AutoSizer className="">
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
            <div className="h-full w-full flex justify-center items-center">
              You need transcribe first
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

const Row = ({ data,index, style }: ListChildComponentProps) => {
   
  return <TextItem text={data[index]} style={style} />;
};

export default Containter;
