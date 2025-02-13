export const Header = ({title}: { title: string }) => {
    return (
        <>
            <h1 className='bold text-xl text-left pl-4 pt-3 pb-4 w-[100%] bg-black rounded-box'>{title}</h1>
            <div className="divider -mt-2 -mb-2 before:bg-white after:bg-white w-[100%]"></div>
        </>
    )
}
