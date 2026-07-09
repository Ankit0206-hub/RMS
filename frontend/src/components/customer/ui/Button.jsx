import React from "react";

export default function Button({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        h-12
        rounded-xl
        bg-orange-500
        hover:bg-orange-600
        text-white
        font-semibold
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}