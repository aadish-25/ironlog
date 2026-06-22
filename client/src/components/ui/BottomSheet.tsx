import React, { useEffect, useRef } from 'react';
// lucide-react icons available if needed

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fixedHeight?: boolean;
}

export function BottomSheet({ isOpen, onClose, title, children, fixedHeight }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-[100] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[101] bg-[#161616] rounded-t-[20px] border-t border-x border-border p-5 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col max-h-[72vh] ${fixedHeight ? 'h-[72vh]' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="flex justify-center mb-4">
          <div className="w-9 h-1 bg-[#2a2a2a] rounded-full" />
        </div>
        <div className="flex items-center justify-between mb-[18px] shrink-0">
          <h2 id="sheet-title" className="font-display text-[22px] text-white tracking-[2px] m-0">{title}</h2>
          <button 
            onClick={onClose}
            className="text-xl text-ghost bg-transparent border-none cursor-pointer hover:text-white transition-colors p-0 flex items-center justify-center leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto pb-4 flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
