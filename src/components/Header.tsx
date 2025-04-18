import {ReactNode} from "react";

export const Header = ({title, children}: { title?: string, children?: ReactNode }) => {
    return (
        <>
            <h1 className='font-bold text-xl text-left pl-4 pt-2 pb-2 w-[100%] bg-black content-center align-middle'>
                {title}
                {children}
            </h1>
            <div className="divider mt-0 mb-0 h-1 before:bg-[#EC3113] before:h-1 after:bg-[#EC3113] after:h-1 w-[100%]"/>
        </>
    )
}
