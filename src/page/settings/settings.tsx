import { dropDatabase, initDatabase } from "@/api/db-api/db-api";
import { Button } from "@/components/ui/button";
import { useTranscribeStore } from "@/store/createStore";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/item";
import Models from "./models";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator"


const Settings = () => {
  const { openFile,resetDB } = useTranscribeStore((state) => ({
    openFile: state.openFile,
    resetDB: state.resetDB,
  }));
  const navigate = useNavigate();
  const clearDB = async () => {
    await dropDatabase();
    await initDatabase();
    
  };

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
     
      <div className="relative group">
        <div className="absolute top-9 text-lg font-bold invisible italic group-hover:visible">Warning: This will clear the file list,and is not recoverable</div>
        <Button
        className=""
        variant={"destructive"}
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
            resetDB()
          }}
        >
          Clear File List
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
