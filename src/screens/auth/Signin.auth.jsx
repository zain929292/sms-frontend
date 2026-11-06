
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

import { GraduationCap, ShieldCheck } from "lucide-react";

// ==================== BRAND PANEL ====================

const BrandPanel = memo(() => (
  <div className="relative hidden lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#0f766e] to-[#0d9488] p-10 xl:p-12">

    {/* Background Decoration */}
    <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full border-[45px] border-white/[0.06]" />
    <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-white/[0.06]" />

    {/* Logo */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
        <GraduationCap size={29} className="text-white" />
      </div>

      <span className="text-xl font-bold tracking-tight text-white">
        SMS Portal
      </span>
    </div>

    {/* Heading */}
    <div className="relative z-10 mt-14">
      <h1 className="text-3xl font-bold leading-tight text-white xl:text-[36px]">
        Manage Your School
        <br />
        <span className="text-[#b7e9df]">With Ease.</span>
      </h1>

      <p className="mt-4 max-w-[340px] text-sm leading-6 text-white/75">
        One place for your students, staff and academic activities.
      </p>
    </div>

    {/* Illustration */}
    <div className="relative z-10 flex flex-1 items-center justify-center">
      <img
        src={DoctorIllustration}
        alt="School Management"
        decoding="async"
        className="max-h-[340px] w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)]"
      />
    </div>

    {/* Bottom Text */}
    <p className="relative z-10 text-xs font-medium tracking-wide text-white/70">
      Simplifying School Management
    </p>

  </div>
));

BrandPanel.displayName = "BrandPanel";

// ==================== SIGN IN ====================

const Signin = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitting = useRef(false);

  const handleEmailChange = useCallback(
    (e) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e) => setPassword(e.target.value),
    []
  );

  useEffect(() => {
    import("../dashboard/Main.dashboard").catch(() => {});
  }, []);

  const handleSignin = useCallback(
    async (event) => {
      event?.preventDefault?.();

      if (submitting.current) return;

      const cleanEmail = email.trim();

      const errors = validateFields({
        email: cleanEmail,
        password,
      });

      const firstError = Object.values(errors)[0];

      if (firstError) {
        toast.error(firstError);
        return;
      }

      submitting.current = true;

      try {
        const result = await dispatch(
          login({
            email: cleanEmail,
            password,
          })
        ).unwrap();

        toast.success(result?.message || "Login successful");

      } catch (err) {
        const message =
          err?.message || "Login failed. Please try again.";

        if (err?.status === 423) {
          toast.error(message, { duration: 5000 });
        } else if (
          err?.attempts !== undefined &&
          3 - err.attempts > 0
        ) {
          toast.error(
            `${message} (${3 - err.attempts} attempts remaining)`
          );
        } else {
          toast.error(message);
        }

      } finally {
        submitting.current = false;
      }
    },
    [email, password, dispatch]
  );

  if (token) {
    return <Navigate to="/overview/dashboard" replace />;
  }

  return (
    <main className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#edf8f6] p-3 sm:p-15">

      {/* Background */}
      <div className="pointer-events-none absolute -left-32 -top-36 h-[430px] w-[430px] rounded-full bg-[#c5eee5]/50 blur-sm" />
      <div className="pointer-events-none absolute -bottom-36 -right-32 h-[430px] w-[430px] rounded-full bg-[#b7e9df]/50 blur-sm" />

      {/* Login Card */}
      <div className="relative z-10 grid h-[min(510px,calc(100dvh-32px))] w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_20px_70px_rgba(15,118,110,0.13)] sm:rounded-3xl lg:grid-cols-2">

        {/* Left Panel */}
        <BrandPanel />

        {/* Right Panel */}
        <section className="relative flex items-center justify-center bg-white px-6 sm:px-12 lg:px-14">

          {/* Mobile Logo */}
          <div className="absolute left-0 right-0 top-7 flex justify-center lg:hidden">
            <div className="flex items-center gap-2">
              <GraduationCap size={29} className="text-[#0f766e]" />
              <span className="text-lg font-bold text-slate-800">
                SMS Portal
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="relative z-10 w-full max-w-[360px]">

            {/* Heading */}
            <div className="mb-9 text-center">

              <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#0d9488]" />

              <h1 className="text-[30px] font-bold tracking-tight text-[#203b43] sm:text-[34px]">
                Welcome <span className="text-[#0f766e]">Back!</span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue
              </p>

            </div>

            {/* Login Form */}
            <form onSubmit={handleSignin} className="space-y-6">

              <InputField
                label="Email Address"
                type="email"
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

              <div className="pt-1">
                <Button
                  title="Sign In"
                  width="100%"
                  onPress={handleSignin}
                  loading={loading}
                />
              </div>

            </form>

            {/* Security */}
            <div className="mt-9 flex items-center justify-center gap-2">
              <ShieldCheck size={17} className="text-[#0d9488]" />

              <span className="text-xs font-medium text-slate-400">
                Secure Login
              </span>
            </div>

          </div>

          {/* Bottom Decoration */}
          <div className="pointer-events-none absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-[#e0f7f1]/70" />

        </section>

      </div>
    </main>
  );
};

export default Signin;
