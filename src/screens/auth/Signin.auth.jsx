/**
 * @file Signin.auth.jsx
 * @module Screens/Auth/Signin
 * @description
 * Hospital Management System Sign-in screen featuring an ultra-polished, responsive layout.
 */

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import "../../styles/global.styles.css";
import DoctorIllustration from "../../assets/illustrations/doctor-character.png";
import InputField from "../../utils/input-field/InputField.util";
import Button from "../../utils/buttons/Button.util";
import { validateFields } from "../../utils/validations/Validations.util";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/slices/Auth.slice.redux";

/**
 * Static left banner. Memoized so it does NOT re-render on every keystroke
 * in the email / password inputs.
 */
const BrandPanel = memo(() => (
  <div className="hidden lg:flex relative bg-gradient-to-b from-[#eafaf7] via-[#d4f6ef] to-[#bef2e8] flex-col justify-between p-10 xl:p-12 border-r border-teal-100/60 overflow-hidden">
    {/* Geometric Accents */}
    <div className="absolute top-8 left-10 w-20 h-20 rounded-full border-4 border-white/50 pointer-events-none" />
    <div className="absolute top-24 right-16 w-10 h-10 rounded-full border-2 border-teal-600/20 pointer-events-none" />
    <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-teal-300/40 blur-3xl pointer-events-none" />

    {/* Hero Header */}
    <div className="z-10">
      <span className="inline-flex items-center px-3.5 py-1 bg-white/70 rounded-full text-xs font-bold text-teal-800 tracking-wider uppercase mb-4 shadow-sm border border-teal-100/50">
        Healthcare Control Center
      </span>
      <h1 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
        WELCOME BACK <span className="text-[#0f766e]">!</span>
      </h1>
      <p className="text-slate-600 text-sm mt-3 font-medium leading-relaxed max-w-xs">
        Access your hospital management dashboard and clinical operations
        platform.
      </p>
    </div>

    {/* Illustration */}
    <div className="relative z-20 flex justify-center items-end mt-auto pt-6 pointer-events-none">
      <img
        src={DoctorIllustration}
        alt="Doctor Illustration"
        decoding="async"
        className="max-h-[380px] xl:max-h-[420px] object-contain drop-shadow-[0_20px_20px_rgba(15,118,110,0.2)]"
      />
    </div>
  </div>
));
BrandPanel.displayName = "BrandPanel";

const Signin = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Guards against the form submit + Button onPress firing twice (double API call).
  const submitting = useRef(false);

  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback(
    (e) => setPassword(e.target.value),
    [],
  );

  // Warm up the dashboard chunk while the user is typing their credentials.
  useEffect(() => {
    const id = setTimeout(
      () => import("../dashboard/Main.dashboard").catch(() => {}),
      300,
    );
    return () => clearTimeout(id);
  }, []);

  const handleSignin = useCallback(
    async (event) => {
      event?.preventDefault?.();
      if (submitting.current) return;

      const cleanEmail = email.trim();
      const errors = validateFields({ email: cleanEmail, password });
      const firstError = Object.values(errors)[0];

      if (firstError) {
        toast.error(firstError);
        return;
      }

      submitting.current = true;
      try {
        const result = await dispatch(
          login({ email: cleanEmail, password }),
        ).unwrap();

        // Redirect happens instantly below (token is now in the store).
        toast.success(result?.message || "Login successful");
      } catch (err) {
        const message = err?.message || "Login failed. Please try again.";

        if (err?.status === 423) {
          toast.error(message, { duration: 5000 });
        } else if (err?.attempts !== undefined && 3 - err.attempts > 0) {
          toast.error(`${message} (${3 - err.attempts} attempts remaining)`);
        } else {
          toast.error(message);
        }
      } finally {
        submitting.current = false;
      }
    },
    [email, password, dispatch],
  );

  // Already logged in (or just logged in) -> go straight to the dashboard.
  if (token) return <Navigate to="/overview/dashboard" replace />;

  return (
    <section
      id="signin-screen"
      className="h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-100 via-[#f0f4f8] to-[#e6fbf8] p-4 sm:p-6 lg:p-8 relative"
    >
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl min-h-[550px] lg:min-h-[620px] bg-white/90 rounded-3xl lg:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,118,110,0.12)] border border-white/60 grid grid-cols-1 lg:grid-cols-2 overflow-hidden z-10 my-auto">
        <BrandPanel />

        {/* Right Form Area */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14 bg-white">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                <span className="text-[#0f766e]">HMS</span> Portal
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSignin}>
              <InputField
                label="Email"
                type="text"
                editable={!loading}
                value={email}
                onChange={handleEmailChange}
                required
              />

              <InputField
                label="Password"
                type="password"
                editable={!loading}
                value={password}
                onChange={handlePasswordChange}
                required
              />

              <div className="pt-2">
                <Button
                  title="Sign In"
                  width="100%"
                  onPress={handleSignin}
                  loading={loading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
