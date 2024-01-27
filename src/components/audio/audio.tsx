import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AudioProps {
  url: string;
}
const Audio = ({ url }: AudioProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="h-full w-full">
      {" "}
      {loaded ? <audio className="w-3/4" controls src={url} /> : <Skeleton className="w-3/4 h-full" />}
      {" "}
    </div>
  );
};

export default Audio;
