import {MouseEvent} from "react";
import {ArrowUp} from "./icons/ArrowUp.tsx";
import {ArrowDown} from "./icons/ArrowDown.tsx";

export interface SubHeaderProps {
    title: string;
    dbProperty: string;
    sort: string;
}

export const SubHeader = ({props, onClick}: {
    props: SubHeaderProps[],
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}) => {
    return (
        <>
            <div className={`columns-${props.length} bg-[#7E7E7E] h-11 pt-2 pl-4 w-[100%] flex justify-between`}>
                {props.map((prop: SubHeaderProps, index: number) => (
                    index == 0 ? (
                        <div className='font-semibold text-md text-left text-white' key={index}>
                            <button onClick={onClick} name={prop.dbProperty} value={prop.sort}>
                                <a href='#' className='flex'>
                                    {prop.title}
                                    {prop.sort === 'asc' ? <ArrowUp/> : <ArrowDown/>}
                                </a>
                            </button>
                        </div>
                    ) : (
                        <div className='font-semibold text-md text-right text-white pr-4' key={index}>
                            <button onClick={onClick} name={prop.dbProperty} value={prop.sort}>
                                <a href='#' className='inline-flex'>
                                    {prop.title}
                                    {prop.sort === 'asc' ? <ArrowUp/> : <ArrowDown/>}
                                </a>
                            </button>
                        </div>
                    )
                ))}
            </div>
            <div className="divider -mt-2 -mb-2 before:bg-white after:bg-white w-[100%]"></div>
        </>
    )
}
