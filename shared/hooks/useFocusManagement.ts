"use client";

import { useEffect, useRef, useCallback } from "react";
import { FocusManager, KEYBOARD_KEYS } from "../utils/accessibility";

// Hook for managing focus within a component
export const useFocusManagement = (
  options: {
    trapFocus?: boolean;
    restoreFocus?: boolean;
    autoFocus?: boolean;
  } = {}
) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const {
    trapFocus = false,
    restoreFocus = false,
    autoFocus = false,
  } = options;

  // Store the previously focused element when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto-focus the first focusable element if requested
    if (autoFocus && containerRef.current) {
      const firstFocusable = FocusManager.getFirstFocusableElement(
        containerRef.current
      );
      firstFocusable?.focus();
    }

    // Restore focus when component unmounts
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus, autoFocus]);

  // Handle keyboard events for focus trapping
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (trapFocus && containerRef.current) {
        FocusManager.trapFocus(containerRef.current, event);
      }
    },
    [trapFocus]
  );

  // Set up event listeners for focus trapping
  useEffect(() => {
    if (trapFocus) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [trapFocus, handleKeyDown]);

  // Utility functions
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = FocusManager.getFirstFocusableElement(
        containerRef.current
      );
      firstFocusable?.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const lastFocusable = FocusManager.getLastFocusableElement(
        containerRef.current
      );
      lastFocusable?.focus();
    }
  }, []);

  const moveFocus = useCallback(
    (direction: "next" | "previous" | "first" | "last") => {
      if (containerRef.current) {
        FocusManager.moveFocus(containerRef.current, direction);
      }
    },
    []
  );

  return {
    containerRef,
    focusFirst,
    focusLast,
    moveFocus,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  handlers: Record<string, (event: KeyboardEvent) => void>
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        handler(event);
      }
    },
    [handlers]
  );

  return { handleKeyDown };
};

// Hook for roving tabindex (useful for toolbars, menus, etc.)
export const useRovingTabindex = (
  items: HTMLElement[],
  activeIndex: number
) => {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, onIndexChange: (newIndex: number) => void) => {
      let newIndex = activeIndex;

      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_RIGHT:
        case KEYBOARD_KEYS.ARROW_DOWN:
          event.preventDefault();
          newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          break;
        case KEYBOARD_KEYS.ARROW_LEFT:
        case KEYBOARD_KEYS.ARROW_UP:
          event.preventDefault();
          newIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          break;
        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          newIndex = 0;
          break;
        case KEYBOARD_KEYS.END:
          event.preventDefault();
          newIndex = items.length - 1;
          break;
      }

      if (newIndex !== activeIndex) {
        onIndexChange(newIndex);
        items[newIndex]?.focus();
      }
    },
    [items, activeIndex]
  );

  return { handleKeyDown };
};

// Hook for managing announcements to screen readers
export const useScreenReaderAnnouncements = () => {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", priority);
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    },
    []
  );

  return { announce };
};

// Hook for detecting user preferences
export const useAccessibilityPreferences = () => {
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const prefersHighContrast = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-contrast: high)").matches;
  }, []);

  const prefersDarkMode = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
  };
};
