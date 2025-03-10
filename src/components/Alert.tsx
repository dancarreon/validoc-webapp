export const Alert = ({message}: { message: string }) => {
    return (
        <div className="alert alert-info text-m text-white bg-[#EC3113] border-none fade-alert">
            <span>{message}</span>
        </div>
    )
}
