import React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";

const ThemeToggle = ({ className = "", size = "md" }) => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Prevent hydration mismatch by showing a placeholder
    return (
      <div
        className={`${className} ${
          size === "sm" ? "w-8 h-8" : "w-10 h-10"
        } rounded-lg bg-gray-200 animate-pulse`}
      />
    );
  }

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        ${className}
        relative inline-flex items-center justify-center
        rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:text-gray-900 dark:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        group
      `}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun Icon */}
      <svg
        className={`
          absolute w-5 h-5 transition-all duration-300 ease-in-out
          ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-75"
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon Icon */}
      <svg
        className={`
          absolute w-5 h-5 transition-all duration-300 ease-in-out
          ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-75"
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-active:opacity-20 transition-opacity duration-150" />
    </button>
  );
};

export default ThemeToggle;
