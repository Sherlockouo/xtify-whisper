import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cx } from "@emotion/css";
import SideBar from "../sidebar/sidebar";
import Router from "../Router";

const Layout = () => {
  return (
    <div className="h-full w-full">
      {/* <div
        data-tauri-drag-region
        className=" h-[3em]  w-full flex justify-center"
      >
        <NavBar />
      </div> */}
      <div className={cx("w-full h-[calc(100vh_-_0em)]")}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            minSize={23}
            maxSize={23}
            defaultSize={23}
            className="h-full flex flex-col"
          >
            <div data-tauri-drag-region className="h-[3em] w-full bg-blue-300">
            </div>
            <div className="flex w-full h-full ">
              <SideBar />
            </div>
          </ResizablePanel>
          <ResizableHandle className=" pointer-events-none" />
          <ResizablePanel
            minSize={70}
            maxSize={95}
            className="h-full"
          >
            <div data-tauri-drag-region className="h-[3em] w-full bg-blue-300">
            </div>
            <div className="h-[100vh_-_3em] w-full">
            <Router />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Layout;
