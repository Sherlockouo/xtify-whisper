import { getVersion } from '@tauri-apps/api/app';

export let VERSION = ""

export const init = async () => {

    VERSION = await getVersion();
}