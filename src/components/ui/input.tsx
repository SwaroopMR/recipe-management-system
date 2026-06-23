import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white border ${
            error ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-blue-100 focus:border-[#2563EB]"
          } rounded-xl text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-semibold text-red-500 px-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white border ${
            error ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-blue-100 focus:border-[#2563EB]"
          } rounded-xl text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 min-h-[100px] resize-y ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-semibold text-red-500 px-1">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
