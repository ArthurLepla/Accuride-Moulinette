'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: number;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (props: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, type }: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-lg shadow-lg min-w-[300px] ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm mt-1 opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 