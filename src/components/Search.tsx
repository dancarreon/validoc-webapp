import {ChangeEvent, MouseEvent, Ref} from "react";

export const Search = ({name, placeholder, value, onChange, onBlur, ref, onClick}: {
    name?: string,
    placeholder?: string,
    value?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onBlur?: (e: ChangeEvent<HTMLInputElement>) => void,
    ref?: Ref<HTMLInputElement>,
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void,
}) => {
    return (
        <div className='search my-3 w-full flex items-center justify-center'>
            <label className="input input-lg rounded-xl">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none"
                       stroke="currentColor">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input type="text" className="grow" placeholder={placeholder} name={name} value={value} ref={ref}
                       onChange={onChange} onBlur={onBlur}/>
                <button className='btn bg-[#EC3113] rounded-lg h-[35px]' type='submit' onClick={onClick}>
                    <svg className="h-[1.3em] opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none"
                           stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                </button>
            </label>
        </div>
    )
}
