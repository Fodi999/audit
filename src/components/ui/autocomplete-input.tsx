"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AutocompleteInputProps {
  value: string
  onValueChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AutocompleteInput({
  value,
  onValueChange,
  suggestions,
  placeholder = "Введите название...",
  disabled,
  className
}: AutocompleteInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue)
    onValueChange(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange(newValue)
    setOpen(newValue.length > 0 && filteredSuggestions.length > 0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-gray-700/30 border-gray-600/30 text-gray-200 hover:bg-gray-700/50",
            !inputValue && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate text-left flex-1">
            {inputValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
        <Command className="bg-gray-800">
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            className="bg-gray-800 border-none text-gray-200"
          />
          <CommandList>
            {filteredSuggestions.length === 0 ? (
              <CommandEmpty className="text-gray-400 py-2 text-center text-sm">
                {inputValue.length > 0 ? "Новый продукт" : "Начните вводить название"}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredSuggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    className="text-gray-200 hover:bg-gray-700/50 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === suggestion ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
