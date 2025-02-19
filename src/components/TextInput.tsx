import * as React from "react";

export const TextInput = ({type, name, placeholder, value, onChange}: {
    type: string,
    name?: string,
    placeholder: string,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    return (
        <input type={type} name={name} placeholder={placeholder} value={value} alt={placeholder}
               className="input w-83 sm:w-100 rounded-full my-2 py-6 bg-white placeholder:text-[#BFBFBF] text-black text-lg"
               onChange={onChange}/>
    )
}
