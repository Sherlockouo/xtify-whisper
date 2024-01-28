import { Store } from "tauri-plugin-store-api";

const db = new Store("config.json");

if (import.meta.env.DEV) {
  (window as any).db = db;
}

export { db };
