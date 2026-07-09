import React from "react";

export default function Input({
  label,
  placeholder,
  type = "text",
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full
          h-12
          rounded-xl
          border
          border-gray-200
          px-4
          outline-none
          focus:border-orange-500
        "
      />
    </div>
  );
}