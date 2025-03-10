import {ChangeEvent, Ref} from "react";

export const TextInput = ({type, name, placeholder, value, onChange, onBlur, ref}: {
    type?: string,
    name?: string,
    placeholder: string,
    value?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onBlur?: (e: ChangeEvent<HTMLInputElement>) => void,
    ref?: Ref<HTMLInputElement>,
}) => {
    return (
        <>
            <input type={type ? type : 'text'}
                   name={name}
                   placeholder={placeholder}
                   value={value !== null ? value : ''} alt={placeholder}
                   onChange={onChange}
                   onBlur={onBlur}
                   ref={ref}
                   className="input w-83 sm:w-100 rounded-full my-2 py-6 bg-white placeholder:text-[#BFBFBF] text-black text-lg"
            />
        </>
    )
}
