import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

export type DropdownElement = {
	id?: string;
	name?: string;
};

type CustomDropdownProps = {
	options: DropdownElement[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	labelStyle?: string;
};

export const DropdownSearch: React.FC<CustomDropdownProps> = (
	{
		options,
		value,
		onChange,
		placeholder = "Seleccione una opción",
		className = 'relative inline-block w-[330px] sm:w-80 md:w-100',
		labelStyle = 'text-gray-300 block relative text-left left-3 sm:left-5 md:left-10 mb-1',
	}) => {

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const ref = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// If an option is selected, choose it
			if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
				const selectedOption = filteredOptions[selectedIndex];
				onChange(selectedOption.id ?? "");
				setOpen(false);
				setSearch("");
				setSelectedIndex(-1);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex(prev => {
				if (prev < filteredOptions.length - 1) {
					return prev + 1;
				}
				return prev;
			});
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex(prev => {
				if (prev > 0) {
					return prev - 1;
				}
				return prev;
			});
		} else if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
			setSearch("");
			setSelectedIndex(-1);
		}
	}

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setSelectedIndex(-1); // Reset selection when search changes
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpen(false);
				setSearch("");
				setSelectedIndex(-1);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Scroll selected option into view
	useEffect(() => {
		if (selectedIndex >= 0 && listRef.current) {
			const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: 'nearest',
					behavior: 'smooth'
				});
			}
		}
	}, [selectedIndex]);

	const selected = useMemo(() => options.find(opt => opt.id === value), [options, value]);
	const filteredOptions = useMemo(() =>
		options.filter(opt =>
			opt.name?.toLowerCase().includes(search.toLowerCase())
		), [options, search]
	);

    return (
        <>
            <label className={labelStyle}>
                {placeholder.includes('Id') ? placeholder[0].toUpperCase() + placeholder.slice(1).replace('Id', '') : placeholder[0].toUpperCase() + placeholder.slice(1)}
            </label>
            <div className={className} ref={ref}>
                <button
                    type="button"
                    className="w-full px-2 py-2 border rounded-lg bg-white text-left text-black text-lg "
                    onClick={() => {
                        if (open) {
                            setSearch(""); // Clear search when closing
                            setSelectedIndex(-1); // Reset selection when closing
                        } else {
                            // When opening, select first option if available
                            setSelectedIndex(filteredOptions.length > 0 ? 0 : -1);
                        }
                        setOpen(o => !o);
                    }}>
                    {selected ? selected.name : "Seleccione una opción"}
                    <span className="float-right">&#9662;</span>
                </button>
                {open && (
                    <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-80 overflow-auto text-black">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border-b-4 border-b-[#EC3113] outline-none pr-20"
                                placeholder="Búsqueda..."
                                value={search}
                                onChange={handleSearchChange}
                                autoFocus
                                onKeyDown={e => handleKeyDown(e)}
                            />
                            <div className="absolute right-2 top-2 text-xs text-gray-400">
                                ↑↓ Enter Esc
                            </div>
                        </div>
                        <ul ref={listRef}>
                            {filteredOptions.length === 0 ? (
                                <li className="px-4 py-2 text-gray-400">
                                    {search ? `No options found for "${search}"` : "No options available"}
                                </li>
                            ) : (
                                filteredOptions.map((opt, index) => (
                                    <li
                                        key={opt.id}
                                        tabIndex={0}
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-200 text-black text-lg text-left ${
                                            opt.id === value ? "bg-gray-100" : ""
                                        } ${
                                            index === selectedIndex ? "bg-blue-100 border-l-4 border-blue-500" : ""
                                        }`}
                                        onClick={() => {
                                            onChange(opt.id ?? "");
                                            setOpen(false);
                                            setSearch("");
                                            setSelectedIndex(-1);
                                        }}
                                    >
                                        {opt.name}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};
