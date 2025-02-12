export const Button = ({label, styles}: { label: string, styles?: string }) => {
    return (
        <button className={'btn w-85 sm:w-90 bg-[#EC3113] flex-auto text-lg rounded-full my-2 py-7 ' + styles}>{label}</button>
    )
}
