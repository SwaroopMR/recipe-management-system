import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, loading = false, disabled, ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB]",
      secondary: "bg-[#F8FAFC] hover:bg-slate-200 text-[#0F172A] border border-slate-200 focus:ring-slate-300",
      success: "bg-[#22C55E] hover:bg-[#16A34A] text-white focus:ring-[#22C55E]",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      outline: "bg-transparent hover:bg-slate-50 text-[#0F172A] border border-slate-300 focus:ring-slate-300",
      ghost: "bg-transparent hover:bg-slate-100 text-[#0F172A] focus:ring-slate-200",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <motion.button
        ref={ref as any}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
