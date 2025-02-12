import {ReactNode} from "react";

export const ButtonWithIcon = ({title, children}: { title: string, children: ReactNode }) => {
    return (
        <button className="btn bg-[#EC3113] rounded-full h-40 w-40 my-5 grid justify-center content-center">
            {children}
            {title}
        </button>
    )
}
