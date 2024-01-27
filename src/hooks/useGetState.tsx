import { useCallback, useRef, useState } from "react";

export const useGetState = (initState: any) => {
  const [state, setState] = useState(initState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);
  return [state, setState, getState];
};
