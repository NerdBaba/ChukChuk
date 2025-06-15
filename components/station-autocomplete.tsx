"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { STATION_CODES } from "@/lib/station-data"

interface StationAutocompleteProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function StationAutocomplete({ placeholder, value, onChange, className }: StationAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStations, setFilteredStations] = useState<Array<{ code: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find the selected station name
  const selectedStation = useMemo(() => {
    return STATION_CODES.find((station) => station.code === value || station.name === value)
  }, [value])

  useEffect(() => {
    // Only search if at least 2 characters are typed
    if (searchQuery.length >= 2) {
      setLoading(true)

      // Clear previous timeout to prevent multiple searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Debounce search to improve performance
      searchTimeoutRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase()
        const results = STATION_CODES.filter(
          (station) => station.name.toLowerCase().includes(query) || station.code.toLowerCase().includes(query),
        ).slice(0, 50) // Limit results to 50 for better performance

        setFilteredStations(results)
        setLoading(false)
        setHighlightedIndex(-1)
      }, 300)
    } else {
      setFilteredStations([])
      setLoading(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filteredStations.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredStations[highlightedIndex]) {
          selectStation(filteredStations[highlightedIndex])
        }
        break
      case "Escape":
        setOpen(false)
        setSearchQuery("")
        break
    }
  }

  const selectStation = (station: { code: string; name: string }) => {
    onChange(station.code)
    setOpen(false)
    setSearchQuery("")
    setHighlightedIndex(-1)
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchQuery("")
  }

  const openDropdown = () => {
    setOpen(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={openDropdown}
        className={cn("w-full justify-between h-12 text-left font-normal flex items-center", className)}
        type="button"
      >
        <span
          className={cn("truncate flex-1 text-left", selectedStation ? "text-foreground" : "text-muted-foreground")}
        >
          {selectedStation ? `${selectedStation.name} (${selectedStation.code})` : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedStation && <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={clearSelection} />}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Searching stations...</p>
              </div>
            )}

            {!loading && searchQuery.length < 2 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
              </div>
            )}

            {!loading && searchQuery.length >= 2 && filteredStations.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">No stations found</p>
              </div>
            )}

            {!loading && filteredStations.length > 0 && (
              <div className="py-1">
                {filteredStations.map((station, index) => (
                  <div
                    key={station.code}
                    onClick={() => selectStation(station)}
                    className={cn(
                      "flex items-center px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      highlightedIndex === index && "bg-accent text-accent-foreground",
                      (value === station.code || value === station.name) && "bg-primary/10",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === station.code || value === station.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{station.name}</span>
                      <span className="text-xs text-muted-foreground">{station.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
