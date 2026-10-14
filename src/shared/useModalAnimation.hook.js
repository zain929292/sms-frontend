/**
 * @file useModalAnimation.js
 * @module Hooks/useModalAnimation
 * @description Manages mount/unmount animation lifecycle for modals.
 */

import { useState, useEffect } from "react";

export const useModalAnimation = (isOpen, duration = 300) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(timer);
    }
    setIsAnimating(false);
    const timer = setTimeout(() => setShouldRender(false), duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  return { shouldRender, isAnimating };
};
