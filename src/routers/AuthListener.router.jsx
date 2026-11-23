import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { logout } from "../redux/slices/Auth.slice.redux";
import { persistor } from "../redux/store/Store.redux";

export const AuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isHandling = false;

    const handleUnauthorized = async () => {
      if (isHandling) return;

      isHandling = true;

      try {
        // Reset Redux authentication state
        dispatch(logout());

        // Wait for pending persistence writes
        await persistor.flush();

        // Remove persisted Redux data
        await persistor.purge();

        // Remove authentication storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("authUser");
        localStorage.removeItem("persist:auth");

        // Redirect to login
        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }
      } finally {
        isHandling = false;
      }
    };

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
    };
  }, [dispatch]);

  return null;
};