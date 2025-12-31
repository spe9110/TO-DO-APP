import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/DarkModeContext'

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`footer w-full h-16 flex justify-center items-center bg-transparent text-black xs:px-[16px] sm:px-[18px] md:px-[18px] lg:px-[64px] xl:px-[100px] 2xl:px-[200px] ${isDark ? 'dark' : ''}`}>
      <p className={`text-sm xs:text-[14px] lg:text-sm text-center ${isDark ? 'text-white' : 'text-black'}`}>
        Challenge by <Link className='text-blue-400 underline' to="https://www.frontendmentor.io/">Frontend Mentor.</Link> Coded by <Link className='text-blue-400 underline' to="https://spe9110.github.io/spencer-wawaku/">Spencer Wawaku</Link>
      </p>
    </div>
  )
}

export default Footer
