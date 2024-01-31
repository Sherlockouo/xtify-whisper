import { getVersion } from '@tauri-apps/api/app';
import { platform,arch } from '@tauri-apps/api/os';


export let VERSION = ""
export let osType = ""
export let osArch = ""

export const init = async () => {

    VERSION = await getVersion();
    osType = await platform();
    osArch = await arch();
}