import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { southAfricanTowns, provinces, Town } from "@/data/southAfricanTowns";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string, town?: Town) => void;
  placeholder?: string;
  className?: string;
}

const LocationSelector = ({
  value,
  onChange,
  placeholder = "Select a location...",
  className,
}: LocationSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTown = useMemo(() => {
    return southAfricanTowns.find(
      (town) => `${town.name}, ${town.province}` === value
    );
  }, [value]);

  const groupedTowns = useMemo(() => {
    const filtered = searchQuery
      ? southAfricanTowns.filter(
          (town) =>
            town.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            town.province.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : southAfricanTowns;

    return provinces.reduce((acc, province) => {
      const provinceTowns = filtered.filter((t) => t.province === province);
      if (provinceTowns.length > 0) {
        acc[province] = provinceTowns;
      }
      return acc;
    }, {} as Record<string, Town[]>);
  }, [searchQuery]);

  const handleSelect = (town: Town) => {
    const locationValue = `${town.name}, ${town.province}`;
    onChange(locationValue, town);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-[1000]" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search towns..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No location found.</CommandEmpty>
            {Object.entries(groupedTowns).map(([province, towns]) => (
              <CommandGroup key={province} heading={province}>
                {towns.map((town) => {
                  const locationValue = `${town.name}, ${town.province}`;
                  return (
                    <CommandItem
                      key={locationValue}
                      value={locationValue}
                      onSelect={() => handleSelect(town)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === locationValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {town.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationSelector;
