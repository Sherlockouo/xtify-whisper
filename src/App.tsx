import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/layout";
import CMDK from "./components/cmdk/cmdk";
import { useEffect } from "react";
import { db } from "./utils/db";
import { useConfig } from "./hooks/useConfig";
import { changeTheme } from "./utils/theme";
import { HashRouter } from "react-router-dom";

function App() {
  const [theme] = useConfig("theme", "light");
  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  useEffect(() => {
    db.load();
  }, []);
  return (
    <div className="h-full w-full">
      <HashRouter>
        <Layout />
        <CMDK />
        <Toaster />
      </HashRouter>
    </div>
  );
}

export default App;
