import {ReactNode} from "react";

export const Container = ({children, styles = ''}: { children?: ReactNode, styles?: string }) => {
    return (
        <div className={'w-95 pb-4 mb-4 bg-[#3F3F3F] rounded-xl place-items-center m-auto ' + styles}>
            {children}
        </div>
    )
}
