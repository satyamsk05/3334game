'use client';
import React, { useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);

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
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 ease-out"
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-2xl bg-surface-raised border border-border-default p-6 shadow-2xl transition-all duration-200 ease-out transform scale-100 opacity-100 z-10`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 pr-2">
            <h3 id="modal-title" className="text-lg font-bold text-text-primary font-sans tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-text-tertiary font-medium">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-strong shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-2 text-sm text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
