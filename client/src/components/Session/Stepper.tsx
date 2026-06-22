import React from "react";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  label: string;
}

export function Stepper({
  value,
  onChange,
  step = 2.5,
  label,
}: StepperProps) {
  const [localValue, setLocalValue] = React.useState(value.toString());

  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
      setLocalValue(parsed.toString());
    } else {
      setLocalValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          onClick={() => onChange(Math.max(0, +(value - step).toFixed(1)))}
          className="w-[30px] h-[30px] bg-raised rounded-md border-none text-lg text-ghost cursor-pointer flex items-center justify-center shrink-0 select-none hover:bg-border transition-colors"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="font-display text-[34px] text-white tracking-[1px] leading-none bg-transparent border-none text-center outline-none w-16 m-0 p-0"
        />
        <button
          onClick={() => onChange(+(value + step).toFixed(1))}
          className="w-[30px] h-[30px] bg-raised rounded-md border-none text-lg text-ghost cursor-pointer flex items-center justify-center shrink-0 select-none hover:bg-border transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
