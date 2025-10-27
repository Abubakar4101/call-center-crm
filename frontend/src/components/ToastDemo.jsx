import React from "react";
import { useToast } from "../contexts/ToastContext.jsx";

const ToastDemo = () => {
  const { success, error, warning, info } = useToast();

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-4">Toast Demo</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => success("Operation completed successfully!")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Success Toast
        </button>
        <button
          onClick={() => error("Something went wrong!")}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Toast
        </button>
        <button
          onClick={() => warning("Please check your input!")}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Warning Toast
        </button>
        <button
          onClick={() => info("Here's some information!")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastDemo;
