export const SubHeader = ({titles}: { titles: string[] }) => {
    return (
        <>
            <div className='columns-2 bg-[#7E7E7E] h-11 pt-2 pl-4 w-[100%]'>
                {titles.map((title: string, index: number) => (
                    index < titles.length - 1 ? (
                        <div className='font-semibold text-md text-left text-white' key={index}>{title}</div>
                    ) : (
                        <div className='font-semibold text-md text-right text-white pr-4' key={index}>{title}</div>
                    )
                ))}
            </div>
            <div className="divider -mt-2 -mb-2 before:bg-white after:bg-white w-[100%]"></div>
        </>
    )
}
