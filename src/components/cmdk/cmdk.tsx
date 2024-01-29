import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
import React from "react"
  

const CMDK = ()=> {
    const [open, setOpen] = React.useState(false)
  
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        }
      }
      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [])
  
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Under Developing...</CommandItem>
            {/* <CommandItem>Search Emoji</CommandItem>
            <CommandItem>
                <span>Calculator</span>
                <CommandShortcut>⌘C</CommandShortcut>
                </CommandItem> */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    )
  }
  

export default CMDK