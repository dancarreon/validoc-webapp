import {ChangeEvent, Ref} from "react";

export type DropdownElement = {
    id?: string;
    name?: string;
};

export const Dropdown = ({elements, placeholder, name, value, onChange, onBlur, ref}: {
    elements: DropdownElement[],
    placeholder: string,
    name?: string,
    value?: string,
    onChange?: (e: ChangeEvent) => void,
    onBlur?: (e: ChangeEvent) => void,
    ref?: Ref<HTMLSelectElement>,
}) => {
    return (
        <>
            <label htmlFor={name} className='text-gray-300 block relative text-left left-3 md:left-10'>
                {placeholder.includes('Id') ? placeholder[0].toUpperCase() + placeholder.slice(1).replace('Id', '') : placeholder[0].toUpperCase() + placeholder.slice(1)}
            </label>
            <select
                id={name}
                name={name}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
                className='dropdown-content menu rounded-box z-1 ml-3 md:ml-10 mb-9 shadow-lg bg-white text-black text-lg w-83 sm:w-100 block overflow-auto'>
                {elements.map((element, index) => {
                    if (index == 0) {
                        return (<option key={index} value=''>Seleccione una opción</option>)
                    } else {
                        if (element.id === value) {
                            return (<option key={element.id} value={element.id} selected>{element.name}</option>)
                        } else {
                            return (<option key={element.id} value={element.id}>{element.name}</option>)
                        }
                    }
                })}
            </select>
        </>
    )
}
