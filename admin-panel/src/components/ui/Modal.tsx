'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Interruptible Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity duration-200 ease-out"
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-3xl bg-white border border-gray-100 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out transform scale-100 opacity-100 z-10`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-gray-900 font-sans tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-gray-500 font-medium">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 !p-0 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-sm text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
