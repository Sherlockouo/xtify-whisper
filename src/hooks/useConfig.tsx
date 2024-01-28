import { emit, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";

import { db } from "@/utils/db";
import { useDebouncedCallback } from "@/utils/useDebouceCallback";

import { useGetState } from "./useGetState";

export const useConfig = (
  key: string,
  defaultValue: any,
  options: any = {}
) => {
  const [property, setPropertyState, getProperty] = useGetState(null);
  const { sync = true } = options;

  // 同步到db (State -> db)
  const syncTodb = useDebouncedCallback(
    (v) => {
      console.log('set key ',key,' value ',v);
      
      db.set(key, v);
      db.save();
      emit(`${key}_changed`, v);
    },
    500,
    []
  );

  // 同步到State (db -> State)
  const syncToState = useCallback((v: any) => {
    if (v !== null) {
      setPropertyState(v);
    } else {
      db.get(key).then((v) => {
        if (v === null) {
          setPropertyState(defaultValue);
          db.set(key, defaultValue);
          db.save();
        } else {
          setPropertyState(v);
        }
      });
    }
  }, []);

  const setProperty = useCallback((v: any, forceSync = false) => {
    setPropertyState(v);
    const isSync = forceSync || sync;
    isSync && syncTodb(v);
  }, []);

  // 初始化
  useEffect(() => {
    syncToState(null);
    if (key.includes("[")) return;
    const unlisten = listen(`${key}_changed`, (e) => {
      syncToState(e.payload);
    });
    return () => {
      unlisten.then((f) => {
        f();
      });
    };
  }, []);

  return [property, setProperty, getProperty];
};
