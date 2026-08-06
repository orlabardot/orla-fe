"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Tag } from "@/types/api"

interface TagsMultiSelectProps {
  tags: Tag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  className?: string
}

export function TagsMultiSelect({
  tags,
  selectedIds,
  onChange,
  placeholder = "Selecionar tags",
  className,
}: TagsMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedTags = tags.filter((tag) => selectedIds.includes(tag.id))

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("w-full justify-between font-normal", className)}
          />
        }
      >
        <span className="flex flex-wrap gap-1">
          {selectedTags.length ? (
            selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="size-4 text-text-muted" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Buscar tag..." />
          <CommandList>
            <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => {
                const checked = selectedIds.includes(tag.id)
                return (
                  <CommandItem key={tag.id} onSelect={() => toggle(tag.id)}>
                    <Check className={cn("size-4", checked ? "opacity-100" : "opacity-0")} />
                    {tag.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
