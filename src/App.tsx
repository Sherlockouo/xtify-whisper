import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/layout";
import CMDK from "./components/cmdk/cmdk";
import { useEffect } from "react";
import { db } from "@/utils/db";
import { useConfig } from "./hooks/useConfig";
import { changeTheme } from "./utils/theme";
import { BrowserRouter } from "react-router-dom";
import { ensureRecordingDir, ensureWaveDir } from "./utils/fs";
import { init, osType } from "@/utils/env";
import { resolveResource } from "@tauri-apps/api/path";

export default function App() {
  const [theme] = useConfig("theme", "light");
  const [builtInModelPath, setBuiltInModelPath] = useConfig(
    "built_in_model_path",
    "empty"
  );
  useEffect(() => {
    changeTheme(theme);
  }, [theme]);
  const initDir = async () => {
    await Promise.all([ensureRecordingDir(), ensureWaveDir()]);
  };
  useEffect(() => {

    const initDatabase = async () => {
      await db.load();
    }
    initDatabase();
    const initModel = async () => {
      await initDir();
      await init();
      let builtInmodel = await resolveResource(
        "resources/models/ggml-base.en.bin"
      );

      if (builtInModelPath === null || builtInModelPath === "") {
        if (osType === "win32") {
          builtInmodel = builtInmodel.replace('\\\\?\\', '')
        }
        console.log('built in model ', builtInmodel);
        setBuiltInModelPath(builtInmodel);
      }
    };
    initModel();
  }, []);

  return (
    <div className="h-full w-full">
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
      <CMDK />
      <Toaster richColors />
    </div>
  );
}
