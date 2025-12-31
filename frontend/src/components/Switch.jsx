import React from "react";
// import { FaMoon } from "react-icons/fa";
import lightIcon from '../assets/icon-sun.svg'
import darkIcon from '../assets/icon-moon.svg'
// import { IoSunnySharp } from "react-icons/io5";
import { useTheme } from "../context/DarkModeContext";

export default function Switch(){
    const { theme, handleThemeChange } = useTheme();
    
    return(
        <div>
            <button onClick={handleThemeChange}>
                {theme === 'light' ? 
                    <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" src={darkIcon} alt="dark icon"/> : 
                    <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" src={lightIcon} alt="light icon"/> }
            </button>
        </div>
    )
}