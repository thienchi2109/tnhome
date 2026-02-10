"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  disabled?: boolean;
  placeholder?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  disabled = false,
  placeholder = "Chọn hoặc nhập danh mục...",
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Generate unique IDs for ARIA relationships
  const listboxId = useId();

  // Keep input in sync with value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        // Reset input to current value if user didn't select anything
        setInputValue(value);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Filter categories based on input
  const filteredCategories = useMemo(() => {
    if (!inputValue.trim()) return categories;
    const search = inputValue.toLowerCase().trim();
    return categories.filter((cat) =>
      cat.toLowerCase().includes(search)
    );
  }, [categories, inputValue]);

  // Check if input is a new category (not in existing list)
  const isNewCategory = useMemo(() => {
    if (!inputValue.trim()) return false;
    const search = inputValue.trim().toLowerCase();
    return !categories.some((cat) => cat.toLowerCase() === search);
  }, [categories, inputValue]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!open) setOpen(true);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isNewCategory && inputValue.trim()) {
        handleCreateNew();
      } else if (filteredCategories.length > 0) {
        handleSelect(filteredCategories[0]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setInputValue(value);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-8 px-2"
          onClick={() => {
            setOpen(!open);
            if (!open) inputRef.current?.focus();
          }}
          disabled={disabled}
          aria-label={open ? "Đóng danh sách" : "Mở danh sách"}
          tabIndex={-1}
        >
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Danh mục"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <div className="max-h-[200px] overflow-y-auto">
            {/* Create new option */}
            {isNewCategory && inputValue.trim() && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={handleCreateNew}
                className={cn(
                  "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm",
                  "bg-primary/5 text-primary hover:bg-primary/10",
                  "focus:bg-primary/10 focus:outline-none"
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Tạo: <strong className="truncate">{inputValue.trim()}</strong>
                </span>
              </button>
            )}

            {/* Existing categories */}
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="option"
                  aria-selected={value === category}
                  onClick={() => handleSelect(category)}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:outline-none",
                    value === category && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === category ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{category}</span>
                </button>
              ))
            ) : !isNewCategory ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Không tìm thấy danh mục
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
