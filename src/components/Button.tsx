import {MouseEventHandler} from "react";

export const Button = ({type, label, styles, onClick}: {
    type?: 'submit' | 'button' | 'reset' | undefined,
    label: string,
    styles?: string
    onClick?: MouseEventHandler,
}) => {
    return (
        <button type={type}
                className={'btn w-50 bg-[#EC3113] flex-auto text-lg rounded-full my-2 py-7 ' + styles}
                onClick={onClick}>
            {label}
        </button>
    )
}
