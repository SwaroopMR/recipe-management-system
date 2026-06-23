import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerActions,
}) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-lg glassmorphism rounded-2xl shadow-2xl p-6 overflow-hidden z-10 flex flex-col gap-4 border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{title}</h3>
                {description && (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 rounded-lg h-auto w-auto text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content Body */}
            {children && <div className="py-2 text-sm text-slate-600">{children}</div>}

            {/* Footer Actions */}
            {footerActions && (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
