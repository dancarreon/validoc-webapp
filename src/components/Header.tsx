import {ReactNode} from "react";

export const Header = ({title, children}: { title?: string, children?: ReactNode }) => {
    return (
        <>
            <h1 className='font-bold text-xl text-left pl-4 pt-2 pb-2 w-[100%] bg-black rounded-box content-center align-middle'>
                {title}
                {children}
            </h1>
            <div className="divider -mt-2 -mb-2 before:bg-white after:bg-white w-[100%]"/>
        </>
    )
}
