import { HashRouter, Route, Routes } from "react-router-dom";
import Containter from "@/page/container/container";
import Settings from "@/page/settings/settings";

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Containter />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
};

export default Router;
