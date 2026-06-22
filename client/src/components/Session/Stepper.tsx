import React from "react";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  label: string;
  disabled?: boolean;
}

export function Stepper({
  value,
  onChange,
  step = 2.5,
  label,
  disabled = false,
}: StepperProps) {
  const [localValue, setLocalValue] = React.useState(value.toString());

  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    if (disabled) return;
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
      setLocalValue(parsed.toString());
    } else {
      setLocalValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = e.target.value;
    
    if (newValue === "") {
      setLocalValue("");
      return;
    }

    // Only allow numbers and at most one decimal point
    if (/^\d*\.?\d*$/.test(newValue)) {
      setLocalValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div>
      <label className="text-[10px] text-ghost tracking-[1.5px] uppercase block mb-1.5">
        {label}
      </label>
      <div className="bg-[#141414] rounded-[10px] p-[12px_8px] flex items-center justify-between">
        <button
          onClick={() => !disabled && onChange(Math.max(0, +(value - step).toFixed(1)))}
          disabled={disabled}
          className={`w-[30px] h-[30px] rounded-md border-none text-lg flex items-center justify-center shrink-0 select-none transition-colors ${disabled ? 'bg-transparent text-ghost/30 cursor-not-allowed' : 'bg-raised text-ghost cursor-pointer hover:bg-border'}`}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={disabled ? "BW" : localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`font-display text-[34px] tracking-[1px] leading-none bg-transparent border-none text-center outline-none w-16 m-0 p-0 ${disabled ? 'text-ghost/50 cursor-not-allowed' : 'text-white'}`}
        />
        <button
          onClick={() => !disabled && onChange(+(value + step).toFixed(1))}
          disabled={disabled}
          className={`w-[30px] h-[30px] rounded-md border-none text-lg flex items-center justify-center shrink-0 select-none transition-colors ${disabled ? 'bg-transparent text-ghost/30 cursor-not-allowed' : 'bg-raised text-ghost cursor-pointer hover:bg-border'}`}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
