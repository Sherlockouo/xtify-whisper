import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/layout";
import CMDK from "./components/cmdk/cmdk";
import { useEffect } from "react";
import { db } from "./utils/db";
import { useConfig } from "./hooks/useConfig";
import { changeTheme } from "./utils/theme";
import { BrowserRouter } from "react-router-dom";
import { ensureRecordingDir, ensureWaveDir } from "./utils/fs";

function App() {
  const [theme] = useConfig("theme", "light");
  useEffect(() => {
    changeTheme(theme);
  }, [theme]);
  const initDir =async () => {
    await Promise.all([ensureRecordingDir(),ensureWaveDir()])
  }
  useEffect(() => {
    db.load();
    initDir();
  }, []);
  
  return (
    <div className="h-full w-full">
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
        <CMDK />
        <Toaster richColors/>
    </div>
  );
}

export default App;
