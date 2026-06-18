import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-[#111111] border border-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 id="modal-title" className="font-display text-[22px] text-white tracking-[1.5px]">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center border-none cursor-pointer hover:bg-raised transition-colors"
            aria-label="Close modal"
          >
            <X size={16} className="text-ghost" />
          </button>
        </div>
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
