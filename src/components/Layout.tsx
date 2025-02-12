import {Outlet} from "react-router";
import {Navbar} from "./Navbar.tsx";

export const Layout = ({showMenu, isAdmin}: { showMenu?: boolean, isAdmin?: boolean }) => {
    return (
        <div className='bg-[#e3dbdb] justify-center items-center text-center min-h-[100vh]'>
            {showMenu && (<Navbar isAdmin={isAdmin}/>)}
            <div>
                <Outlet/>
            </div>
        </div>
    )
}
