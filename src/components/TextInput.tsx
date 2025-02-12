export const TextInput = ({type, placeholder, value}: { type: string, placeholder: string, value?: string }) => {
    return (
        <input type={type} placeholder={placeholder} value={value}
               className="input w-85 sm:w-90 rounded-full my-2 py-6 bg-white placeholder:text-[#BFBFBF] text-black text-lg "/>
    )
}
