import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <div className="w-full flex justify-between p-2">
        Settings page
          <CrossCircledIcon  onClick={() => {
            navigate(`/`);
          }} />
      </div>
      <div>
        TODO: 
        1. 模型选择
        2. 清除DB/缓存
        3. 用户注册登录？
      </div>
    </div>
  );
};

export default Settings;
