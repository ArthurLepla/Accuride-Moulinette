'use client';

import React, { useState } from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Info, AlertCircle, HelpCircle, Check } from 'lucide-react';

type TooltipType = 'info' | 'warning' | 'help' | 'success';

interface InteractiveTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  type?: TooltipType;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  interactive?: boolean;
  isDetailedView?: boolean;
  badge?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function InteractiveTooltip({
  children,
  content,
  type = 'info',
  icon,
  className,
  delay = 0,
  position = 'top',
  interactive = false,
  isDetailedView = false,
  badge,
  onAction,
  actionLabel = 'Voir plus',
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Déterminer l'icône en fonction du type
  const getIcon = () => {
    if (icon) return icon;
    
    switch(type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'help': return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };
  
  // Classes CSS en fonction du type
  const getTypeClasses = () => {
    switch(type) {
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30';
      case 'help': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30';
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30';
    }
  };
  
  // Animation variants
  const tooltipVariants = {
    initial: { 
      opacity: 0, 
      y: position === 'bottom' ? -10 : position === 'top' ? 10 : 0,
      x: position === 'right' ? -10 : position === 'left' ? 10 : 0,
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      y: position === 'bottom' ? -5 : position === 'top' ? 5 : 0,
      x: position === 'right' ? -5 : position === 'left' ? 5 : 0,
      scale: 0.98,
      transition: {
        duration: 0.15
      }
    }
  };
  
  const expandVariants = {
    collapsed: { height: 'auto', maxHeight: '80px', overflow: 'hidden' },
    expanded: { height: 'auto', maxHeight: '300px', overflow: 'auto' }
  };
  
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div className="inline-flex relative">
            {children}
            {interactive && (
              <div className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer z-10",
                type === 'info' ? 'bg-blue-500' : 
                type === 'warning' ? 'bg-amber-500' : 
                type === 'help' ? 'bg-purple-500' : 
                'bg-green-500'
              )}>
                {getIcon()}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <AnimatePresence>
          {isOpen && (
            <TooltipContent 
              side={position} 
              className={cn("p-0 border-0 shadow-none bg-transparent w-auto", className)}
              forceMount
            >
              <motion.div
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  "p-3 border rounded-lg shadow-soft backdrop-blur-sm w-64",
                  isDetailedView ? "p-4 w-80" : "p-3 w-64",
                  getTypeClasses()
                )}
              >
                <div className="flex items-start gap-2">
                  {!isDetailedView && (
                    <div className="shrink-0 mt-0.5">
                      {getIcon()}
                    </div>
                  )}
                  <div className="flex-1">
                    {isDetailedView && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "p-1.5 rounded-full",
                          type === 'info' ? 'bg-blue-100 dark:bg-blue-800/30' : 
                          type === 'warning' ? 'bg-amber-100 dark:bg-amber-800/30' : 
                          type === 'help' ? 'bg-purple-100 dark:bg-purple-800/30' : 
                          'bg-green-100 dark:bg-green-800/30'
                        )}>
                          {getIcon()}
                        </div>
                        {badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            type === 'info' ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300' : 
                            type === 'warning' ? 'bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300' : 
                            type === 'help' ? 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300' : 
                            'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300'
                          )}>
                            {badge}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <motion.div
                      variants={expandVariants}
                      animate={isExpanded ? 'expanded' : 'collapsed'}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "text-sm",
                        !isExpanded && "line-clamp-3"
                      )}
                    >
                      {content}
                    </motion.div>
                    
                    {isDetailedView && content && typeof content === 'string' && content.length > 120 && (
                      <button 
                        className={cn(
                          "text-xs mt-2 font-medium",
                          type === 'info' ? 'text-blue-600 dark:text-blue-400' : 
                          type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                          type === 'help' ? 'text-purple-600 dark:text-purple-400' : 
                          'text-green-600 dark:text-green-400'
                        )}
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                    
                    {onAction && (
                      <button 
                        className={cn(
                          "text-xs mt-2 font-medium underline",
                          type === 'info' ? 'text-blue-600 dark:text-blue-400' : 
                          type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                          type === 'help' ? 'text-purple-600 dark:text-purple-400' : 
                          'text-green-600 dark:text-green-400'
                        )}
                        onClick={() => {
                          onAction();
                          setIsOpen(false);
                        }}
                      >
                        {actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
} 