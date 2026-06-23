import React from "react";
import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animateHover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", children, animateHover = true, ...props }, ref) => {
    const CardWrapper = animateHover ? motion.div : "div";
    const hoverProps = animateHover
      ? {
          whileHover: { y: -6, boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.08), 0 10px 10px -5px rgba(37, 99, 235, 0.04)" },
          transition: { duration: 0.25, ease: "easeOut" },
        }
      : {};

    return (
      <CardWrapper
        ref={ref as any}
        {...hoverProps}
        className={`glassmorphism rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
        {...(props as any)}
      >
        {children}
      </CardWrapper>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-bold tracking-tight text-[#0F172A] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);
