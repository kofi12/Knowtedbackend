import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

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
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
      onClick={onClose}
    >
      <div
        className={`
          bg-white dark:bg-gray-950
          border border-gray-400 dark:border-gray-600
          rounded-lg md:rounded-xl
          shadow-2xl
          ${sizes[size]} w-full
          max-h-[90vh] overflow-y-auto
          text-gray-900 dark:text-gray-50
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="
            flex items-center justify-between
            p-4 md:p-6
            border-b border-gray-300 dark:border-gray-700
            sticky top-0
            bg-white dark:bg-gray-950
            z-10
          "
        >
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="
              p-1.5
              text-gray-700 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-800
              hover:text-gray-900 dark:hover:text-gray-100
              rounded-lg transition-colors
            "
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end
        pt-5 mt-2
        border-t border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}