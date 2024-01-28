import { dropDatabase, initDatabase } from "@/api/db-api/db-api";
import { Button } from "@/components/ui/button";
import { useTranscribeStore } from "@/store/createStore";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/item";
import Models from "./models";
import { resourceDir } from "@tauri-apps/api/path";
import { useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { openFile } = useTranscribeStore((state) => ({
    openFile: state.openFile,
  }));
  const navigate = useNavigate();
  const clearDB = async () => {
    await dropDatabase();
    await initDatabase();
    
  };

  useEffect(()=>{
    
  },[])
  return (
    <div className="w-full h-full px-2">
      <div className="w-full flex justify-between p-2">
        Settings page
        <CrossCircledIcon
          onClick={() => {
            navigate(`/`);
          }}
        />
      </div>
     
      <div>
        <Button
          onClick={async() => {
            await clearDB();
            const item: FileItem = {
              text: "",
              file_name: "",
              file_path: "",
              file_type: "",
              origin_file_path: "",
              duration: 0,
              model: "",
            };
            openFile(item);
            toast.success("Cleared DB.")
          }}
        >
          Clear DB
        </Button>
        TODO: 1. 滚动动画
      </div>
      <div className="">
        <Models />
      </div>
    </div>
  );
};

export default Settings;
