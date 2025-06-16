import React, {useEffect, useRef, useState} from "react";

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
};

export const CustomDropdown: React.FC<CustomDropdownProps> = (
    {
        options,
        value,
        onChange,
        placeholder = "Seleccione una opción",
        className = "",
    }) => {

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find(opt => opt.id === value);
    const filteredOptions = options.filter(opt =>
        opt.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <label className='text-gray-300 block relative text-left left-3 md:left-10 sm:left-10 mb-1 mt-'>
                {placeholder.includes('Id') ? placeholder[0].toUpperCase() + placeholder.slice(1).replace('Id', '') : placeholder[0].toUpperCase() + placeholder.slice(1)}
            </label>
            <div className={`relative inline-block ${className} w-100`} ref={ref}>
                <button
                    type="button"
                    className="w-full px-2 py-2 border rounded-lg bg-white text-left text-black text-lg "
                    onClick={() => setOpen(o => !o)}>
                    {selected ? selected.name : "Seleccione una opción"}
                    <span className="float-right">&#9662;</span>
                </button>
                {open && (
                    <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-auto text-black">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border-b-4 border-b-[#EC3113] outline-none"
                            placeholder="Búsqueda..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            onKeyDown={e => handleKeyDown(e)}
                        />
                        <ul ref={listRef}>
                            {filteredOptions.length === 0 && (
                                <li className="px-4 py-2 text-gray-400">No options found</li>
                            )}
                            {filteredOptions.map(opt => (
                                <li
                                    key={opt.id}
                                    tabIndex={0}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-200 text-black text-lg text-left ${opt.id === value ? "bg-gray-100" : ""}`}
                                    onClick={() => {
                                        onChange(opt.id ?? "");
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    {opt.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};
