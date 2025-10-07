// Accessibility utilities for keyboard navigation, ARIA labels, and screen reader support

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

// ARIA role constants
export const ARIA_ROLES = {
  BUTTON: "button",
  TAB: "tab",
  TABPANEL: "tabpanel",
  TABLIST: "tablist",
  MENU: "menu",
  MENUITEM: "menuitem",
  DIALOG: "dialog",
  ALERT: "alert",
  STATUS: "status",
  REGION: "region",
  BANNER: "banner",
  MAIN: "main",
  NAVIGATION: "navigation",
  COMPLEMENTARY: "complementary",
  CONTENTINFO: "contentinfo",
  TABLE: "table",
  GRID: "grid",
  GRIDCELL: "gridcell",
  COLUMNHEADER: "columnheader",
  ROWHEADER: "rowheader",
} as const;

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");

  // Get all focusable elements within a container
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  // Get the first focusable element
  static getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const elements = this.getFocusableElements(container);
    return elements.length > 0 ? elements[0] : null;
  }

  // Get the last focusable element
  static getLastFocusableElement(container: HTMLElement): HTMLElement | null {
    const elements = this.getFocusableElements(container);
    return elements.length > 0 ? elements[elements.length - 1] : null;
  }

  // Trap focus within a container (useful for modals)
  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== KEYBOARD_KEYS.TAB) return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Move focus to next/previous element
  static moveFocus(
    container: HTMLElement,
    direction: "next" | "previous" | "first" | "last"
  ): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    let targetIndex: number;
    switch (direction) {
      case "next":
        targetIndex =
          currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
      case "previous":
        targetIndex =
          currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case "first":
        targetIndex = 0;
        break;
      case "last":
        targetIndex = focusableElements.length - 1;
        break;
      default:
        return;
    }

    focusableElements[targetIndex]?.focus();
  }
}

// ARIA label generators
export const generateAriaLabel = {
  // For buttons
  button: (action: string, context?: string): string => {
    return context ? `${action} ${context}` : action;
  },

  // For form inputs
  input: (label: string, required?: boolean, invalid?: boolean): string => {
    let ariaLabel = label;
    if (required) ariaLabel += ", required";
    if (invalid) ariaLabel += ", invalid";
    return ariaLabel;
  },

  // For charts
  chart: (type: string, title: string, dataPoints?: number): string => {
    let label = `${type} chart: ${title}`;
    if (dataPoints) label += `, ${dataPoints} data points`;
    return label;
  },

  // For tables
  table: (title: string, rows?: number, columns?: number): string => {
    let label = `Table: ${title}`;
    if (rows && columns) label += `, ${rows} rows, ${columns} columns`;
    return label;
  },

  // For navigation
  navigation: (current: string, total?: number, position?: number): string => {
    let label = `Navigation: ${current}`;
    if (total && position) label += `, ${position} of ${total}`;
    return label;
  },

  // For status messages
  status: (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ): string => {
    return `${type}: ${message}`;
  },
};

// Screen reader utilities
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
): void => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard event handlers
export const createKeyboardHandler = (
  handlers: Record<string, (event: KeyboardEvent) => void>
) => {
  return (event: KeyboardEvent) => {
    const handler = handlers[event.key];
    if (handler) {
      handler(event);
    }
  };
};

// Common keyboard navigation patterns
export const keyboardNavigationPatterns = {
  // Tab navigation (for tab panels)
  tabs: (
    event: KeyboardEvent,
    currentIndex: number,
    totalTabs: number,
    onTabChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_LEFT:
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalTabs - 1;
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = currentIndex < totalTabs - 1 ? currentIndex + 1 : 0;
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        newIndex = totalTabs - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      onTabChange(newIndex);
    }
  },

  // Menu navigation
  menu: (
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onItemChange: (index: number) => void,
    onItemSelect?: (index: number) => void,
    onClose?: () => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        newIndex = totalItems - 1;
        break;
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        event.preventDefault();
        onItemSelect?.(currentIndex);
        return;
      case KEYBOARD_KEYS.ESCAPE:
        event.preventDefault();
        onClose?.();
        return;
    }

    if (newIndex !== currentIndex) {
      onItemChange(newIndex);
    }
  },

  // Table navigation
  table: (
    event: KeyboardEvent,
    currentRow: number,
    currentCol: number,
    totalRows: number,
    totalCols: number,
    onCellChange: (row: number, col: number) => void
  ) => {
    let newRow = currentRow;
    let newCol = currentCol;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        newRow = currentRow > 0 ? currentRow - 1 : totalRows - 1;
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        newRow = currentRow < totalRows - 1 ? currentRow + 1 : 0;
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        event.preventDefault();
        newCol = currentCol > 0 ? currentCol - 1 : totalCols - 1;
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        event.preventDefault();
        newCol = currentCol < totalCols - 1 ? currentCol + 1 : 0;
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        if (event.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        if (event.ctrlKey) {
          newRow = totalRows - 1;
          newCol = totalCols - 1;
        } else {
          newCol = totalCols - 1;
        }
        break;
    }

    if (newRow !== currentRow || newCol !== currentCol) {
      onCellChange(newRow, newCol);
    }
  },
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (
    color1: [number, number, number],
    color2: [number, number, number]
  ): number => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (
    color1: [number, number, number],
    color2: [number, number, number],
    level: "AA" | "AAA" = "AA",
    size: "normal" | "large" = "normal"
  ): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);

    if (level === "AAA") {
      return size === "large" ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === "large" ? ratio >= 3 : ratio >= 4.5;
    }
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  },
};

// Skip link utility
export const createSkipLink = (
  targetId: string,
  text: string = "Skip to main content"
): HTMLElement => {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50";

  return skipLink;
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// High contrast detection
export const prefersHighContrast = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: high)").matches;
};
