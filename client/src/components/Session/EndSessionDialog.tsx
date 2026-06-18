import React from "react";

interface EndSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEnd: () => void;
}

export function EndSessionDialog({
  isOpen,
  onClose,
  onConfirmEnd,
}: EndSessionDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 z-[190] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Centered dialog */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-[340px] bg-[#1c1c1c] rounded-2xl p-[28px_24px_24px] z-[200] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <p
          id="dialog-title"
          className="font-display text-[26px] tracking-[1px] m-[0_0_8px] text-white"
        >
          End session?
        </p>
        <p className="text-[13px] text-[#666] m-[0_0_24px] leading-[1.55]">
          Your progress is saved. You can resume this session later.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onClose}
            className="w-full p-3.5 bg-[#2a2a2a] border-none rounded-[10px] text-white font-display text-lg tracking-[1.5px] cursor-pointer hover:bg-[#333] transition-colors"
          >
            KEEP LOGGING
          </button>
          <button
            onClick={onConfirmEnd}
            className="w-full p-3.5 bg-transparent border border-[#2a2a2a] rounded-[10px] text-[#555] font-display text-base tracking-[1.5px] cursor-pointer hover:bg-raised/50 transition-colors"
          >
            END SESSION
          </button>
        </div>
      </div>
    </>
  );
}
