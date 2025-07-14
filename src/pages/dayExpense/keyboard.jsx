import { useRef, useState,useEffect } from "react";

// Enhanced KeyboardSelect Component with double-enter functionality
const KeyboardSelect = ({
  value,
  options,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = "Select option",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    options.findIndex((opt) => opt.value === value)
  );
  const [highlightedIndex, setHighlightedIndex] = useState(
    options.findIndex((opt) => opt.value === value)
  );
  const selectRef = useRef(null);

  useEffect(() => {
    const index = options.findIndex((opt) => opt.value === value);
    setSelectedIndex(index);
    setHighlightedIndex(index);
  }, [value, options]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!isOpen) {
          // First Enter: Open dropdown
          setIsOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          // Second Enter: Select highlighted option and close
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            const selectedOption = options[highlightedIndex];
            setSelectedIndex(highlightedIndex);
            onChange({ target: { value: selectedOption.value } });
            setIsOpen(false);

            // Trigger blur to save and move to next cell
            setTimeout(() => {
              if (onBlur) onBlur();
            }, 50);
          }
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          const nextIndex =
            highlightedIndex < options.length - 1 ? highlightedIndex + 1 : 0;
          setHighlightedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(
            selectedIndex >= 0 ? selectedIndex : options.length - 1
          );
        } else {
          const prevIndex =
            highlightedIndex > 0 ? highlightedIndex - 1 : options.length - 1;
          setHighlightedIndex(prevIndex);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(selectedIndex);
        break;

      case "Home":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case "End":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;

      default:
        // Pass through other keys to parent handler only when dropdown is closed
        if (!isOpen && onKeyDown) {
          onKeyDown(e);
        }
        break;
    }
  };

  const handleBlur = (e) => {
    // Close dropdown on blur
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(selectedIndex);
    }, 100);

    if (onBlur) onBlur(e);
  };

  const selectedOption =
    options[selectedIndex] || options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <div
        ref={selectRef}
        className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${isOpen ? "ring-1 ring-blue-500" : ""} ${className}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === highlightedIndex
                  ? "bg-blue-100 text-blue-900"
                  : index === selectedIndex
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                setSelectedIndex(index);
                onChange({ target: { value: option.value } });
                setIsOpen(false);
                setTimeout(() => {
                  if (onBlur) onBlur();
                }, 50);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyboardSelect;
