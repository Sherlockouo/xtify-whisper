import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { createAudioUrlFromFile } from "@/utils/files";
import { useTranscribeStore } from "@/store/createStore";
import { useShallow } from "zustand/react/shallow";
import { css, cx } from "@emotion/css";
import { Button } from "../ui/button";

interface AudioProps {
  url: string;
  currentTime: number;
  playing: boolean;
}
const Audio = ({ url, currentTime, playing }: AudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.currentTime !== currentTime) {
        audioRef.current.currentTime = currentTime;
      }

      if (playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTime, playing]);
  return (
    <div className="h-full w-full">
      <audio className="w-full" controls src={url} ref={audioRef} />
    </div>
  );
};

export const AudioControl = () => {
  const [url, setURL] = useState("");
  const [loadingBlobURL, setLoadingBlobURL] = useState(false);
  const { openFile, playingFile, updatePlaying } = useTranscribeStore(
    useShallow((state) => ({
      openFile: state.open_file,
      playingFile: state.playing_file,
      updatePlaying: state.updatePlaying,
    }))
  );
  const createBlobURL = async () => {
    const blobURL = await createAudioUrlFromFile(openFile.file_path);
    setLoadingBlobURL(true);
    setURL(blobURL);
    setLoadingBlobURL(false);
  };
  useEffect(() => {
    if (openFile.file_path !== "") {
      setURL("")
      updatePlaying({ playing: false, currentTime: 0 });
      createBlobURL();
    }
  }, [openFile]);

  return (
    <div
      className={cx(
        "flex gap-1 items-center p-1 backdrop-blur-md ",
        css`
          grid-area: foot;
        `
      )}
    >
      <div className={cx(" py-2 ")}>
        {url ? (
          loadingBlobURL ? (
            <Skeleton className="w-full" />
          ) : (
            <div className="flex gap-1 items-center">
              <div className="w-[600px] ">
                <Audio
                  url={url}
                  currentTime={playingFile.currentTime}
                  playing={playingFile.playing}
                />
              </div>
              <div className="flex items-center gap-3">
                {/* TODO: export  */}
                <Button onClick={() => {}}>Export plaintext</Button>
                <Button onClick={() => {}}>Export vtt</Button>
              </div>
            </div>
          )
        ) : (
          <Skeleton className="w-full" />
        )}
      </div>
    </div>
  );
};

export default Audio;
