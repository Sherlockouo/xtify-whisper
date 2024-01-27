import { useTranscribeStore } from "@/store/createStore";
import { TextItem } from "../../components/item";
import Audio from "../../components/audio/audio";
import { useEffect, useState } from "react";
import { createAudioUrlFromFile } from "@/utils/files";
import { ScrollArea } from "@/components/ui/scroll-area"

const Containter = () => {
  const [url, setURL] = useState("");

  const useOpenFile = useTranscribeStore((state) => state.open_file);
  console.log(useOpenFile);
  const createBlobURL = async () => {
    const blobURL = await createAudioUrlFromFile(useOpenFile.file_path);
    console.log("url ", blobURL);
    setURL(blobURL);
  };
  
  useEffect(() => {
    if(useOpenFile.file_path !== "")
      createBlobURL();
  }, [useOpenFile.file_path]);
  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea
       className="taller:h-[55em] tall:h-[45rem] normalh:h-[35rem] h-[25rem] w-full flex flex-col">
        {useOpenFile.text.split("\n").map((line, index) => (
          <TextItem key={index} text={line} />
        ))}
      </ScrollArea>
      <div className="flex-1 w-full py-2">
        {
          url && 
        <Audio url={url} />
        }
      </div>
    </div>
  );
};

export default Containter;
