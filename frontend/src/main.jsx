import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app.jsx";
import { isActiveDriver, formatDate } from "./utils/helper";
import "./style.css";

window.isActiveDriver = isActiveDriver;
window.formatDate = formatDate;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
