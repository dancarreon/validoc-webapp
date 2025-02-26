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
import {Users} from "./pages/admin/Users.tsx";
import {NewUser} from "./pages/admin/NewUser.tsx";
import {UserInfo} from "./pages/admin/UserInfo.tsx";
import {Layout} from "./components/Layout.tsx";

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
                    <Route path="usuarios" element={<Users/>}/>
                    <Route path="nuevo-usuario" element={<NewUser/>}/>
                    <Route path="usuario/:id" element={<UserInfo />}/>
                    <Route path="datos-nacional" element={<NationalData/>}/>
                    <Route path="sellos" element={<Stamps/>}/>
                    <Route path="folios" element={<Folios/>}/>
                    <Route path="traza" element={<Track/>}/>
                    <Route path="traza/:id" element={<Track/>}/>
                    <Route path="historial" element={<History/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App
