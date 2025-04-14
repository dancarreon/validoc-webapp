import {ReactNode} from "react";

export const ButtonWithIcon = ({title, children, styles = 'h-40 w-40 my-5 grid'}: {
    title?: string,
    children?: ReactNode,
    styles?: string
}) => {
    return (
        <button className={'btn bg-[#EC3113] rounded-full justify-center content-center ' + styles}>
            {children}
            {title}
        </button>
    )
}
