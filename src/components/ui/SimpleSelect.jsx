import React, { useEffect, useRef, useState } from "react";

export default function SimpleSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  isViewMode = false,
  className = "",
  displayValue = null,
  buttonClassName = "",
  dropdownClassName = "",
  optionClassName = "",
  placement = "bottom",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) setOpen(false);
  }, [value]);

  const resolveValue = (opt) =>
    typeof opt === "object" && opt !== null
      ? opt.value ?? opt.label ?? String(opt)
      : opt;
  const resolveLabel = (opt) =>
    typeof opt === "object" && opt !== null
      ? opt.label ?? String(resolveValue(opt))
      : String(opt);

  const selectedOption = options.find((o) => resolveValue(o) === value);
  const selectedLabel =
    displayValue !== null
      ? displayValue
      : selectedOption
      ? resolveLabel(selectedOption)
      : placeholder || "Select";

  return (
    <div
      className={`relative ${
        disabled && !isViewMode ? "opacity-60" : ""
      } ${className}`}
      ref={containerRef}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full border rounded-lg px-3 py-2.5 text-left text-foreground focus:outline-none focus:ring-2 flex items-center justify-between ${
          disabled
            ? isViewMode
              ? "bg-zinc-100 dark:bg-zinc-900 cursor-default border-zinc-200 dark:border-zinc-800/50 border-dashed"
              : "bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-60 border-border"
            : "bg-background"
        } ${
          className.includes("border-red-500")
            ? "border-red-500 focus:ring-red-500/20"
            : disabled && !isViewMode
            ? ""
            : disabled && isViewMode
            ? ""
            : "border-border focus:ring-accent/20"
        } ${buttonClassName}`}
      >
        <span className={`${value ? "" : "text-muted-foreground"}`}>
          {selectedLabel}
        </span>
        <svg
          className="h-4 w-4 text-muted-foreground"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute z-[9999] w-full max-h-56 overflow-auto rounded-lg border border-border bg-background shadow-lg left-0 ${
            placement === "top" ? "mb-1 bottom-full" : "mt-1 top-full"
          } ${dropdownClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options
            </div>
          ) : (
            options.map((opt) => {
              const optValue = resolveValue(opt);
              const optLabel = resolveLabel(opt);
              const selected = optValue === value;
              return (
                <button
                  type="button"
                  key={String(optValue)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(optValue);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary text-foreground"
                  } ${optionClassName}`}
                >
                  {optLabel}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
