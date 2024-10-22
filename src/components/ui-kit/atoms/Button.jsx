// src/components/atoms/Button.jsx

import React from 'react';

const Button = ({
  text,
  variant = 'primary',
  cssClassesProps = '',
  onClick,
  disabled = false,
  icon = null, // Optional SVG icon prop
  iconPosition = 'left', // Default position of the icon
}) => {


    

  const baseStyles = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 transition-all flex items-center justify-center';
  const variants = {
    primary: `
      bg-blue-600
      hover:bg-blue-700
      active:bg-blue-600
      focus:outline-none
      focus:ring
      focus:ring-blueShades-100
      text-white
      font-bold
      rounded-lg
      leading-none
    `,
    secondary: `
      bg-white
      hover:bg-green-600
      hover:text-white
      active:bg-green-600
      border
      border-gray-300
      focus:outline-none
      focus:ring
      focus:ring-greenShades-100
      text-gray-700
      font-bold
      rounded-lg
      leading-none
    `,
    danger: `
      bg-red-600 
      hover:bg-red-700 
      active:bg-red-600 
      focus:outline-none 
      focus:ring 
      focus:ring-red-100 
      text-white 
      font-bold 
      rounded-lg
      leading-none
    `,
    success: `
      bg-green-500 
      hover:bg-green-600 
      active:bg-green-500 
      focus:outline-none 
      focus:ring-green-300 
      text-white 
      font-bold 
      rounded-lg
      leading-none
    `,
    disable: `
      bg-gray-50
      border
      border-gray-300
      focus:outline-none 
      text-gray-400
      font-bold 
      rounded-lg
      leading-none
      cursor-not-allowed
    `,
    datePicker: '',  // You can add styles for datePicker here if needed.
    delete: `
      bg-red-600 
      hover:bg-red-700 
      active:bg-red-600 
      focus:outline-none 
      focus:ring 
      focus:ring-red-100 
      text-white 
      font-bold 
      rounded-lg
      leading-none
    `,
    shade: `
      bg-gray-50
      hover:bg-gray-200
      active:bg-gray-50
      border-2
      border-gray-300
      focus:outline-none 
      focus:ring 
      focus:ring-grayShades-50
      text-gray-700
      font-bold 
      rounded-lg
      leading-none
    `,
    AiVariant: `
      bg-gradient-to-r from-[#1D817E] via-[#12B7B2] to-[#23B6DC]
      text-white
      font-bold
      rounded-lg
      leading-none
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-custom-gradient
    `,
    outlined: `
      bg-white
      hover:bg-green-600
      hover:text-green
      active:bg-green-600 
      border
      border-green-600
      focus:outline-none 
      focus:ring 
      focus:ring-greenShades-100
      text-green-700
      font-bold 
      rounded-lg
      leading-none
    `,
  };
  

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${cssClassesProps}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">
          {icon}
        </span>
      )}
      {text}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
