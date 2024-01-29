import { Route, Routes } from "react-router-dom";
import Containter from "@/page/container/container";
import Settings from "@/page/settings/settings";
import Home from "@/page/home/home";

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/content" element={<Containter />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
};

export default Router;
