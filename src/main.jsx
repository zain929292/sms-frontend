
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import RootNavigator from "./routers/Root.router";
import { Toaster } from "react-hot-toast";
import "./styles/global.styles.css";

// Electron desktop app uses HashRouter.
// Normal website continues using BrowserRouter.
const Router = window.acadexDesktop?.isDesktop
  ? HashRouter
  : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <RootNavigator />

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerClassName="!top-6 !right-6 !z-[9999]"
      />
    </Router>
  </React.StrictMode>
);
