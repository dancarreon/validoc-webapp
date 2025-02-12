import logo from '../assets/capitoil_logo.png'

export const Logo = () => {
    return (
        <div className="bg-black rounded-t-xl mb-5 sm:mb-5 pt-10 pb-5 pl-3.5">
            <img src={logo} alt="Capitoil" className='rounded-t-xl'/>
        </div>
    )
}
