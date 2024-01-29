import { dropDatabase, initDatabase } from "@/api/db-api/db-api";
import { Button } from "@/components/ui/button";
import { useTranscribeStore } from "@/store/createStore";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/item";
import Models from "./models";
import { useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator"

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
        Settings
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
      </div>
      <div>
      <Separator className="my-1" />
      </div>
      <div className="">
        <Models />
      </div>
    </div>
  );
};

export default Settings;
