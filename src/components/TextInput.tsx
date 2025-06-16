import {ChangeEvent, Ref} from "react";

export const TextInput = ({type, name, placeholder, value, onChange, onBlur, ref, readOnly}: {
    type?: string,
    name?: string,
    placeholder: string,
    value?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onBlur?: (e: ChangeEvent<HTMLInputElement>) => void,
    ref?: Ref<HTMLInputElement>,
    readOnly?: boolean,
}) => {
    return (
        <div className='relative mt-10'>
            <input type={type ? type : 'text'}
                   id={name}
                   name={name}
                   placeholder={placeholder}
                   value={value !== null ? value : ''} alt={placeholder}
                   onChange={onChange}
                   onBlur={onBlur}
                   ref={ref}
                   readOnly={readOnly}
                   className='peer h-10 w-83 sm:w-100 pl-3 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400
                   focus:text-black focus:bg-white focus:outline-none focus:border-b-4 focus:border-b-[#EC3113] mb-2
                   placeholder-transparent focus:rounded-t-sm'
            />
            {
                type !== 'hidden' &&
				<label htmlFor={name} className='absolute left-3 md:left-10 sm:left-10 -top-6.5 text-md text-gray-300
				peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-placeholder-shown:left-5
				md:peer-placeholder-shown:left-13 sm:peer-placeholder-shown:left-13 transition-all cursor-text'>
                    {placeholder.includes('Id') ? placeholder[0].toUpperCase() + placeholder.slice(1).replace('Id', '') : placeholder[0].toUpperCase() + placeholder.slice(1)}
				</label>
            }
        </div>
    )
}
