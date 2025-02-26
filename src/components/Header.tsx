import {ReactNode} from "react";

export const Header = ({title, children}: { title: string, children?: ReactNode }) => {
    return (
        <>
            <h1 className='font-bold text-xl text-left pl-4 pt-3 pb-4 w-[100%] bg-black rounded-box'>
                {title}
                {children}
            </h1>
            <div className="divider -mt-2 -mb-2 before:bg-white after:bg-white w-[100%]"/>
        </>
    )
}
