import {ReactNode} from "react";

export const Toast = ({children, styles}: { children: ReactNode, styles?: string }) => {
    return (
        <div className={'toast toast-top toast-start z-100 float-left mt-[5rem] ' + styles}>
            {children}
        </div>
    )
}
