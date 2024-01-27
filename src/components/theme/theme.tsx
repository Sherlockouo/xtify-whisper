import { useConfig } from "@/hooks/useConfig"
import { Button } from "../ui/button"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"

const Theme = ()=>{
    const [getTheme,setTheme] = useConfig("theme","light")
    return (
        <>
            <Button 
            size={"icon"}
            onClick={()=>{
                if(getTheme === "light"){
                    setTheme("dark")
                    return
                }
                setTheme("light")
            }}
            >
                {getTheme === "light" ? <SunIcon />: <MoonIcon />}
            </Button>
        </>
    )
}
export default Theme