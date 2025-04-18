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
        <div className='relative mt-7'>
            {/*<label className="text-black fixed mt-[-2px] bg-white rounded-box px-2 text-gray-500 text-sm">{placeholder}</label>*/}
            {/*<label className="text-black text-sm bg-white rounded-box px-2 text-gray-500 float-right mr-10 pb-1 -mb-6 relative w-100">{placeholder}</label>*/}
            <input type={type ? type : 'text'}
                   id={name}
                   name={name}
                   placeholder={placeholder}
                   value={value !== null ? value : ''} alt={placeholder}
                   onChange={onChange}
                   onBlur={onBlur}
                   ref={ref}
                   className='peer h-10 w-83 sm:w-100 pl-3 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400
                   focus:text-black focus:bg-white focus:outline-none focus:border-b-4 focus:border-b-[#EC3113] mb-2
                   placeholder-transparent focus:rounded-t-sm'
                /*className="input w-83 sm:w-100 rounded-full my-2 py-6 bg-white placeholder:text-[#BFBFBF] text-black text-lg focus:isolation-auto
                placeholder:text-right placeholder:text-sm placeholder:relative placeholder:top-[0px]"*/
            />
            <label htmlFor={name} className='absolute left-3 md:left-10 -top-6.5 text-md text-gray-300
            peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
            peer-placeholder-shown:left-5 md:peer-placeholder-shown:left-13 transition-all'>
                {placeholder.includes('Id') ? placeholder[0].toUpperCase() + placeholder.slice(1).replace('Id', '') : placeholder[0].toUpperCase() + placeholder.slice(1)}
            </label>
        </div>
    )
}
