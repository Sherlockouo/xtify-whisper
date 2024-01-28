import { dropDatabase, initDatabase } from "@/api/db-api/db-api";
import { Button } from "@/components/ui/button";
import { useTranscribeStore } from "@/store/createStore";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { FileItem } from '@/components/item';

const Settings = () => {
  const {openFile} = useTranscribeStore((state)=>({openFile:state.openFile}))
  const navigate = useNavigate();
  const clearDB = async ()=>{
    await dropDatabase();
    await initDatabase();

  }
  return (
    <div className="w-full h-full px-2">
      <div className="w-full flex justify-between p-2">
        Settings page
          <CrossCircledIcon  onClick={() => {
            navigate(`/`);
          }} />
      </div>
      <div>
        <Button onClick={()=>{
          clearDB()
          const item:FileItem = {
            text: "",
            file_name: "",
            file_path: "",
            file_type: "",
            origin_file_path: "",
            duration: 0,
            model: ""
          }
          openFile(item)
        }}>Clear DB</Button>
        TODO: 
        1. 模型选择
      </div>
    </div>
  );
};

export default Settings;
