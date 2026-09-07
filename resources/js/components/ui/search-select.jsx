import { forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchSelect = forwardRef(function SearchSelect(
    { value, placeholder, search, setSearch, options, onChange, disabled, invalid },
    ref,
) {
    const [open, setOpen] = useState(false);
    const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
    );
    const selected = options.find((option) => option.value === value)?.label;

    return (
        <div ref={ref} className="relative">
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setOpen((current) => !current)}
                className={`h-9 w-full justify-between px-3 text-left font-normal ${invalid ? 'border-destructive' : ''}`}
                aria-expanded={open}
            >
                <span className={selected ? '' : 'text-muted-foreground'}>
                    {selected || placeholder}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                    <Input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari..."
                        className="mb-1 h-8 border-0 bg-transparent shadow-none focus-visible:ring-2"
                    />
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.map((option) => (
                            <Button
                                type="button"
                                key={option.value}
                                variant="ghost"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className="h-auto w-full justify-start px-2 py-1.5 text-left font-normal"
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default SearchSelect;
