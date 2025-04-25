import {MouseEvent, ReactNode} from "react";

export const ButtonWithIcon = ({title, placeholder, children, styles = 'h-40 w-40 my-5 grid', onClick}: {
    title?: string,
    placeholder?: string,
    children?: ReactNode,
    styles?: string
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}) => {
    return (
        <button title={placeholder}
                onClick={onClick}
                className={'btn bg-[#EC3113] rounded-full justify-center content-center ' + styles}>
            {children}
            {title}
        </button>
    )
}
