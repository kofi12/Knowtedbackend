import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 pointer-events-none">
        <div
          className={`border rounded-lg md:rounded-xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto pointer-events-auto`}
          style={{
            backgroundColor: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'white',
            color: theme === 'dark' ? 'hsl(0 0% 100%)' : 'rgb(17 24 39)',
            borderColor: theme === 'dark' ? 'hsl(217.2 14.3% 30%)' : 'hsl(0 0% 89%)',
          }}
        >
          <div
            className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0"
            style={{
              backgroundColor: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'white',
              borderColor: theme === 'dark' ? 'hsl(217.2 14.3% 30%)' : 'hsl(0 0% 89%)',
            }}
          >
            <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: theme === 'dark' ? 'hsl(210 40% 96%)' : 'hsl(0 0% 40%)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'hsl(210 40% 10%)' : 'hsl(0 0% 95%)';
                e.currentTarget.style.color = theme === 'dark' ? 'white' : 'rgb(17 24 39)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme === 'dark' ? 'hsl(210 40% 96%)' : 'hsl(0 0% 40%)';
              }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

export function ModalFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-5 mt-2 border-t ${className}`}
      style={{
        borderColor: theme === 'dark' ? 'hsl(217.2 14.3% 30%)' : 'hsl(0 0% 89%)',
      }}
    >
      {children}
    </div>
  );
}