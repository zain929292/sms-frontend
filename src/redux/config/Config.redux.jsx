/**
 * @file Config.redux.js
 * @module Core/Configuration
 * @description
 * Centralized Application Configuration Manager.
 * * This module serves as the single source of truth for environment-specific
 * variables and external service endpoints. It facilitates seamless switching
 * between development (local) and production (cloud) environments.
 * * **Key Values:**
 * - **BACKEND_API_URL:** The base endpoint for all RESTful API communications.
 * * @constant {Object} CONFIG
 * @property {string} BACKEND_API_URL - The base URL used by services to communicate with the backend.
 */

const CONFIG = {
  /** Prod Backend API Url */
  LOCAL_API_URL: "http://127.0.0.1:8000/api",
  BACKEND_API_URL: "https://hms.retailer-connect.com/api",
};

export default CONFIG;
