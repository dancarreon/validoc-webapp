import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Login} from "./pages/auth/Login.tsx";
import {MenuUser} from "./pages/user/MenuUser.tsx";
import {NationalData} from "./pages/user/NationalData.tsx";
import {Stamps} from "./pages/user/Stamps.tsx";
import {Folios} from "./pages/user/Folios.tsx";
import {Track} from "./pages/user/Track.tsx";
import {History} from "./pages/user/History.tsx";
import {MenuAdmin} from "./pages/admin/MenuAdmin.tsx";
import {Users} from "./pages/admin/users/Users.tsx";
import {NewUser} from "./pages/admin/users/NewUser.tsx";
import {UserInfo} from "./pages/admin/users/UserInfo.tsx";
import {Layout} from "./components/Layout.tsx";
import {States} from "./pages/admin/states/States.tsx";
import {StateInfo} from "./pages/admin/states/StateInfo.tsx";
import {Tads} from "./pages/admin/tads/Tads.tsx";
import {TadInfo} from "./pages/admin/tads/TadInfo.tsx";
import {Claves} from "./pages/admin/claves/Claves.tsx";
import {ClaveInfo} from "./pages/admin/claves/ClaveInfo.tsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Login/>}/>
                </Route>

                {/* User Routes */}
                <Route path="user" element={<Layout showMenu/>}>
                    <Route index element={<MenuUser/>}/>
                    <Route path="datos-nacional" element={<NationalData/>}/>
                    <Route path="sellos" element={<Stamps/>}/>
                    <Route path="folios" element={<Folios/>}/>
                    <Route path="traza" element={<Track/>}/>
                    <Route path="traza/:id" element={<Track/>}/>
                    <Route path="historial" element={<History/>}/>
                </Route>

                {/* Admin Routes */}
                <Route path="admin" element={<Layout showMenu isAdmin/>}>
                    <Route index element={<MenuAdmin/>}/>
                    {/*Admin Users*/}
                    <Route path="usuarios" element={<Users/>}/>
                    <Route path="nuevo-usuario" element={<NewUser/>}/>
                    <Route path="usuario/:id" element={<UserInfo/>}/>
                    {/*Admin History/Tracks/Documents*/}
                    <Route path="historial" element={<History/>}/>
                    <Route path="traza" element={<Track/>}/>
                    <Route path="traza/:id" element={<Track/>}/>
                    <Route path="datos-nacional" element={<NationalData/>}/>
                    <Route path="sellos" element={<Stamps/>}/>
                    <Route path="folios" element={<Folios/>}/>
                    {/*Admin States*/}
                    <Route path="estados" element={<States/>}/>
                    <Route path="estados/:id" element={<StateInfo/>}/>
                    {/*Admin Tads*/}
                    <Route path="tads" element={<Tads/>}/>
                    <Route path="tads/:id" element={<TadInfo/>}/>
                    {/*Admin Claves*/}
                    <Route path="claves" element={<Claves/>}/>
                    <Route path="claves/:id" element={<ClaveInfo/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App
