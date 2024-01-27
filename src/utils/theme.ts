// if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//     theme = "dark";
//   } else {
//     theme = "light";


//   }
export const getTheme = () => {
    return document.body.getAttribute('class')
}

export const changeTheme = (theme: 'light' | 'dark') => {
    document.body.setAttribute('class', theme)
}