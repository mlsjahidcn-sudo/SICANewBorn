'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * SearchableSelect — type-to-search combobox built on shadcn's
 * Popover + Command. Used for picking a university / program from a
 * long list where a plain <Select> would be too clumsy to scroll.
 *
 *   <SearchableSelect
 *     value={applicationData.targetUniversity}
 *     onChange={setSelectedUniversity}
 *     options={universities.map((u) => ({ value: u.slug, label: u.name, sublabel: u.nameCn }))}
 *     placeholder="Pick a university"
 *     emptyText="No matches"
 *   />
 *
 * Why a custom component instead of shadcn's stock combobox example:
 * the shadcn example ties into the Form component which we don't use
 * here. This version is form-agnostic and works with any onChange.
 */
export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  /** Render a disabled "(none)" option at the top with this value. */
  clearValue?: string;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
  /** Locale hint used for default placeholder / search text. */
  locale?: 'en' | 'zh';
  /** When the user is in a slow connection, the list might still be
   * loading. Show a small inline hint instead of an empty popover. */
  loading?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  emptyText = 'No matches',
  searchPlaceholder = 'Search…',
  clearValue,
  clearLabel,
  disabled,
  className,
  loading,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between rounded-none font-normal h-10 px-3',
            !selected && 'text-gray-400',
            className,
          )}
        >
          {loading ? (
            <span className="text-gray-400">Loading…</span>
          ) : selected ? (
            <span className="flex flex-col items-start text-left truncate">
              <span className="truncate">{selected.label}</span>
              {selected.sublabel && (
                <span className="text-xs text-gray-500 truncate">{selected.sublabel}</span>
              )}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 rounded-none"
        align="start"
      >
        <Command shouldFilter>
          <div className="flex items-center border-b border-gray-200 px-3">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <CommandInput
              placeholder={searchPlaceholder}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>{loading ? 'Loading…' : emptyText}</CommandEmpty>
            <CommandGroup>
              {clearValue && (
                <CommandItem
                  value={`__clear__${clearLabel ?? ''}`}
                  onSelect={() => {
                    onChange(clearValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === clearValue ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {clearLabel ?? '(none)'}
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.sublabel ?? ''} ${option.value}`}
                  disabled={option.disabled}
                  onSelect={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex flex-col">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-gray-500">{option.sublabel}</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
