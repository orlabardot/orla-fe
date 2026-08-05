"use client"

import { useEffect, useRef, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"

// Input de busca com debounce que também sincroniza de volta quando `value`
// muda por uma fonte externa (ex: botão "Limpar filtros", remoção de badge,
// navegação back/forward) — sem isso o campo fica com texto desatualizado
// depois de um clear vindo de fora do próprio input.
export function useSyncedSearchInput(
  value: string,
  onChange: (value: string) => void,
  delay = 300
) {
  const [input, setInput] = useState(value)
  const debounced = useDebounce(input, delay)
  const skipNextSync = useRef(false)

  useEffect(() => {
    if (debounced !== value) {
      skipNextSync.current = true
      onChange(debounced)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve reagir ao próprio debounce, não a mudanças externas de `value`
  }, [debounced])

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    setInput(value)
  }, [value])

  return [input, setInput] as const
}
