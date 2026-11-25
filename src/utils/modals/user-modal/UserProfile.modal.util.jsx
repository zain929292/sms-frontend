
import React, { useEffect, useState, useCallback } from "react";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { logout } from "../../../redux/slices/Auth.slice.redux";
import { persistor } from "../../../redux/store/Store.redux";
import api from "../../../redux/config/Api.redux";

const UserProfileModal = ({
  isOpen,
  onClose,
  userName: fallbackName = "Sana Mahmood",
  userRole: fallbackRole = "School Administrator",
  onSignOut,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: fallbackName,
    role: fallbackRole,
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setUserInfo({
          name: parsedUser.name || fallbackName,
          role: parsedUser.role_name || fallbackRole,
        });
      }
    } catch (error) {
      console.error("Failed to parse user:", error);
    }
  }, [fallbackName, fallbackRole]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    try {
      // Revoke token from backend
      await api.post(
        "/auth/logout",
        {},
        { skipAuth: false }
      );
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      // Reset Redux authentication state
      dispatch(logout());

      // Remove persisted Redux auth state
      await persistor.purge();

      // Remove authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("authUser");
      localStorage.removeItem("persist:auth");

      toast.success("Logged out successfully!");

      if (onSignOut) {
        onSignOut();
      }

      onClose();
      navigate("/", { replace: true });
    }
  }, [dispatch, navigate, onClose, onSignOut]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`
          absolute right-0 top-full mt-5 w-64 rounded-2xl
          bg-white shadow-xl border z-50 overflow-hidden
          transition-all duration-200 ease-out origin-top-right
          ${
            isAnimating
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95"
          }
        `}
        style={{
          borderColor: "var(--gray)",
          fontFamily: "var(--font-family)",
        }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: "var(--gray)" }}
        >
          <h4
            className="text-base font-bold leading-tight"
            style={{ color: "var(--dark)" }}
          >
            {userInfo.name}
          </h4>

          <p className="text-xs text-slate-400 mt-1">
            {userInfo.role}
          </p>
        </div>

        <div className="p-2 space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-rose-50 text-rose-600"
          >
            <LogOut size={18} className="text-rose-600 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfileModal;
