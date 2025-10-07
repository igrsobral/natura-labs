import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<unknown>;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, labelProps, description, error, required, children, ...props }, ref) => {
    const id = React.useId();
    const childId = (children.props as Record<string, unknown>)?.id as string || id;
    const descriptionId = description ? `${childId}-description` : undefined;
    const errorId = error ? `${childId}-error` : undefined;

    // Clone the child element to add necessary props
    const childElement = React.cloneElement(children, {
      id: childId,
      "aria-describedby": cn(
        (children.props as Record<string, unknown>)?.["aria-describedby"] as string,
        descriptionId,
        errorId
      ).trim() || undefined,
      "aria-invalid": error ? true : (children.props as Record<string, unknown>)?.["aria-invalid"],
      state: error ? "error" : (children.props as Record<string, unknown>)?.state,
    } as Record<string, unknown>);

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label
            htmlFor={childId}
            {...labelProps}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {childElement}
        {description && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground leading-normal"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="text-sm text-error-600 leading-normal dark:text-error-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
export type { FormFieldProps };