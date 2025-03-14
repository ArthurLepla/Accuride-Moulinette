'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Clock, ChevronDown, ChevronUp, ArrowRight, Info, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';

interface EnergyAlertProps {
  children?: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "gradient";
  type?: "info" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  animation?: boolean;
  duration?: number;
  easing?: string;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  onDismiss?: () => void;
  closable?: boolean;
  id?: string;
  severity?: string;
  status?: string;
  time?: string;
  affectedArea?: string;
  onResolve?: () => void;
  details?: React.ReactNode;
  userName?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  glass: "bg-white/10 backdrop-blur-lg text-white dark:bg-gray-900/50",
  solid: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 text-white dark:from-gray-900/50 dark:to-gray-900/30"
};

const typeStyles = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const sizeStyles = {
  sm: "p-3 text-sm",
  md: "p-4 text-base",
  lg: "p-5 text-lg"
};

const iconStyles = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
};

const defaultIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle
};

const alertVariants = {
  initial: {
    opacity: 0,
    y: -20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export function EnergyAlert({
  children,
  variant = "default",
  type = "info",
  size = "md",
  animation = true,
  duration = 0.3,
  easing = "easeOut",
  className,
  title,
  description,
  icon,
  onClose,
  onDismiss,
  closable = false,
  id,
  severity,
  status,
  time,
  affectedArea,
  onResolve,
  details,
  userName
}: EnergyAlertProps) {
  const Icon = defaultIcons[type];
  const handleClose = onClose || onDismiss;

  return (
    <motion.div
      variants={animation ? alertVariants : undefined}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "rounded-lg flex items-start gap-3",
        variantStyles[variant],
        typeStyles[type],
        sizeStyles[size],
        className
      )}
    >
      {icon || <Icon className={cn("flex-shrink-0", iconStyles[size])} />}
      <div className="flex-1">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        {description ? (
          <p className="text-sm opacity-90">{description}</p>
        ) : (
          children
        )}
      </div>
      {closable && handleClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
        >
          <X className={cn("flex-shrink-0", iconStyles[size])} />
        </button>
      )}
    </motion.div>
  );
} 