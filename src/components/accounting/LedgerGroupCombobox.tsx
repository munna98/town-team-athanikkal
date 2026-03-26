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

interface LedgerGroup {
    id: string
    name: string
    nature: string
}

interface LedgerGroupComboboxProps {
    groups: LedgerGroup[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function LedgerGroupCombobox({
    groups,
    value,
    onValueChange,
    placeholder = "Select ledger group...",
    className,
    disabled = false,
}: LedgerGroupComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const selectedGroup = groups.find((group) => group.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full min-w-0 justify-between font-normal", className)}
                    disabled={disabled}
                >
                    <span className="min-w-0 flex-1 truncate text-left">
                        {selectedGroup ? `${selectedGroup.name} (${selectedGroup.nature})` : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search ledger group..." />
                    <CommandList>
                        <CommandEmpty>No ledger group found.</CommandEmpty>
                        <CommandGroup>
                            {groups.map((group) => (
                                <CommandItem
                                    key={group.id}
                                    value={`${group.name} ${group.nature}`}
                                    onSelect={() => {
                                        onValueChange(group.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === group.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {group.name} ({group.nature})
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
