export const Header = ({title}: { title: string }) => {
    return (
        <>
            <h1 className='bold text-xl text-left pl-4 pt-3'>{title}</h1>
            <div className="divider mt-2.5 -mb-2 before:bg-white after:bg-white"></div>
        </>
    )
}
