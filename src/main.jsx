/**
 * Application Entry Point
 *
 * This file is the main entry for the React application.
 * It sets up:
 * - React 18 root rendering with `ReactDOM.createRoot`
 * - Strict Mode for highlighting potential problems
 * - Browser-based routing using `react-router-dom` (`BrowserRouter`)
 * - Global navigation via `RootNavigator`
 * - Global styles (`global.styles.css`)
 * - Toast notifications (`react-hot-toast`) with custom styles for
 *   success, error, loading, and custom states.
 *
 * Features:
 * - Customizable toast UI with consistent design tokens (colors, fonts, shadows)
 * - High z-index positioning to ensure toasts appear above UI layers
 * - Blur and border effects for a modern glassmorphism look
 *
 * @module main
 * @requires react
 * @requires react-dom
 * @requires react-router-dom
 * @requires react-hot-toast
 * @requires ./navigation/Root.navigator
 * @requires ./styles/global.styles.css
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootNavigator from "./routers/Root.router";
import { Toaster } from "react-hot-toast";
import "./styles/global.styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RootNavigator />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerClassName="!top-6 !right-6 !z-[9999]"
      />
    </BrowserRouter>
  </React.StrictMode>,
);
