import { cx } from "@emotion/css";
import { useEffect } from "react";
import { toast } from "sonner";
import { useConfig } from "@/hooks/useConfig";
import { Button } from "@/components/ui/button";
import { openFileWithFilter } from "@/utils/fs";
import {
  Cross1Icon,
  FilePlusIcon,
  InfoCircledIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Models = () => {
  const [builtInModelPath] = useConfig("built_in_model_path", "");
  const [modelPath, setModelPath] = useConfig("model_path", []);
  const [defaultModelPath, setDefaultModelPath] = useConfig(
    "default_model_path",
    ""
  );
  useEffect(() => {
    if (modelPath && !modelPath.includes(builtInModelPath)) {
      setModelPath([builtInModelPath, ...modelPath]);
    }
  }, []);
  async function addRecord() {
    const file = await openFileWithFilter("modelFilter");
    if (
      modelPath && modelPath.includes(file.originalPath)
    ) {
      toast.warning("Model already exists.");
      return;
    }
    setModelPath([...modelPath, file.originalPath]);
  }

  const Model = ({ model }: { model: string }) => {
    return (
      <div className="group relative flex items-center gap-2 hover:bg-gray-200 rounded-md px-1 ">
        <div className=" whitespace-nowrap max-w-3/5 overflow-hidden overflow-ellipsis ">
          {model}
        </div>
        <div className="flex items-center justify-center">
          {builtInModelPath !== model && (
            <motion.div
              whileHover={{
                scale: 1.2,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center justify-center border-solid border-[1px] rounded-md m-1 "
              onClick={() => {
                (modelPath as string[]).splice(
                  (modelPath as string[]).indexOf(model),
                  1
                );
                setModelPath(modelPath);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Cross1Icon className={cx("text-red-500")} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete the model</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
          <motion.div
            whileHover={{
              scale: 1.2,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => {
              setDefaultModelPath(model);
            }}
            className={cx(
              "group-hover:visible flex items-center justify-center border-solid border-[1px] rounded-md m-1",
              defaultModelPath === model ? "visible" : "invisible"
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <TargetIcon className="text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to set as default model</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-2 my-2 h-full w-full">
      <div className="py-2">Models</div>
      <div className="text-sm opacity-60 flex flex-col gap-1 items-start">
        <div>User Customize model paths,model should be end with `.bin` .</div>
        <div className="flex  items-center gap-2">
          <InfoCircledIcon /> Tips:
          <div className="flex items-center">
            <TargetIcon className="text-green-500" />
            `default model`
          </div>
          <div className="flex items-center">
            <Cross1Icon className="text-red-500" />
            `delete the model`
          </div>
        </div>
      </div>
      <div className="flex gap-1 flex-col">
        <div className="flex w-full  flex-col items-start gap-2 justify-center space-x-2">
          <div className="text-lg w-full px-3 py-3 border-solid border-[1px] rounded-md relative">
            {modelPath &&
              modelPath.map((model: string, index: number) => (
                <Model key={index} model={model} />
              ))}
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              addRecord();
            }}
          >
            <FilePlusIcon /> add models
          </Button>
        </div>
        <div className="relative"></div>
      </div>
    </div>
  );
};
export default Models;
