import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
}

interface EnergyNotificationProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
  className?: string;
}

const notificationVariants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const typeStyles = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  success: "bg-green-500/10 border-green-500/20 text-green-500",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  error: "bg-red-500/10 border-red-500/20 text-red-500"
};

export function EnergyNotification({
  notifications,
  onRemove,
  className
}: EnergyNotificationProps) {
  return (
    <div className={cn("fixed bottom-4 right-4 z-50 space-y-2", className)}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border",
              typeStyles[notification.type || "info"]
            )}
          >
            <div className="flex-1">
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 