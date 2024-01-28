import { css, cx } from "@emotion/css";
import SideBar from "../sidebar/sidebar";
import Router from "../Router";
import { Separator } from "@/components/ui/separator";
import { AudioControl } from "../audio/audio";

const Layout = () => {
  return (
    <div className="h-full w-full">
      <div
        className={cx(
          "w-full h-[calc(100vh_-_2em)]",
          css`
            display: grid;
            grid-template-rows: 1fr min-content;
            grid-template-columns: 300px 1px 1fr 1fr 1fr;
            grid-template-areas:
              "side seperator main main main"
              "side seperator foot foot foot";
          `
        )}
      >
        <div
          className={cx(css`
            grid-area: side;
          `)}
        >
          <SideBar />
        </div>

        <Separator orientation="vertical" className={cx("",css`
        grid-area:seperator
        `)} />

        <div
          className={cx(
            "w-full no-scrollbar",
            css`
              grid-area: main;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              flex-grow: 1;
              padding: 0;
              overflow-y: scroll;
              position: relative;
            `
          )}
        >
          <div
        data-tauri-drag-region
        className={cx(
          "min-h-[2em]",
          "z-10 sticky top-0 w-full flex justify-center"
        )}
      >
      </div>
          <Router />
        </div>
        <div
          className={cx(
            " flex flex-col justify-center  flex-grow-1",
            css`
              grid-area: foot;
              position: relative;
            `
          )}
        >
          <AudioControl />
        </div>
      </div>
    </div>
  );
};

export default Layout;
