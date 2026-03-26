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

interface Ledger {
    id: string
    name: string
    code: string
    partyType?: string | null
}

interface LedgerComboboxProps {
    ledgers: Ledger[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    /** Whether to show codes for all or just members */
    showMemberCodesOnly?: boolean
    clearable?: boolean
    clearLabel?: string
}

export function LedgerCombobox({
    ledgers,
    value,
    onValueChange,
    placeholder = "Select ledger...",
    className,
    disabled = false,
    showMemberCodesOnly = true,
    clearable = false,
    clearLabel = "Clear selection",
}: LedgerComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedLedger = ledgers.find((l) => l.id === value)

    const getDisplayName = (l: Ledger) => {
        const showCode = showMemberCodesOnly ? l.partyType === "MEMBER" : true
        if (showCode && l.code && !l.name.includes(l.code)) {
            return `${l.name} (${l.code})`
        }
        return l.name
    }

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
                        {selectedLedger ? getDisplayName(selectedLedger) : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No ledger found.</CommandEmpty>
                        {clearable && (
                            <CommandGroup className="border-b">
                                <CommandItem
                                    value="--all--"
                                    onSelect={() => {
                                        onValueChange("")
                                        setOpen(false)
                                    }}
                                    className="text-slate-500 italic"
                                >
                                    {clearLabel}
                                </CommandItem>
                            </CommandGroup>
                        )}
                        <CommandGroup>
                            {ledgers.map((l) => (
                                <CommandItem
                                    key={l.id}
                                    value={getDisplayName(l)}
                                    onSelect={() => {
                                        onValueChange(l.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === l.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {getDisplayName(l)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
