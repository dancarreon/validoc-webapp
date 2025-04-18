import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Login} from "./pages/auth/Login.tsx";
import {MenuUser} from "./pages/user/MenuUser.tsx";
import {NewTraza} from "./pages/traza/NewTraza.tsx";
import {Stamps} from "./pages/traza/Stamps.tsx";
import {Folios} from "./pages/traza/Folios.tsx";
import {Track} from "./pages/traza/Track.tsx";
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
import {Razones} from "./pages/admin/razon/Razones.tsx";
import {RazonInfo} from "./pages/admin/razon/RazonInfo.tsx";
import {NewRazon} from "./pages/admin/razon/NewRazon.tsx";
import {Products} from "./pages/admin/product/Products.tsx";
import {ProductInfo} from "./pages/admin/product/ProductInfo.tsx";
import {NewProduct} from "./pages/admin/product/NewProduct.tsx";
import {NewState} from "./pages/admin/states/NewState.tsx";
import {NewTad} from "./pages/admin/tads/NewTad.tsx";
import {NewClave} from "./pages/admin/claves/NewClave.tsx";

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
                    <Route path="datos-nacional" element={<NewTraza/>}/>
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
                    <Route path="usuario/:id" element={<UserInfo/>}/>
                    <Route path="nuevo-usuario" element={<NewUser/>}/>
                    {/*Admin States*/}
                    <Route path="estados" element={<States/>}/>
                    <Route path="estados/:id" element={<StateInfo/>}/>
                    <Route path="nuevo-estado" element={<NewState/>}/>
                    {/*Admin Tads*/}
                    <Route path="tads" element={<Tads/>}/>
                    <Route path="tads/:id" element={<TadInfo/>}/>
                    <Route path="nuevo-tad" element={<NewTad/>}/>
                    {/*Admin Claves*/}
                    <Route path="claves" element={<Claves/>}/>
                    <Route path="claves/:id" element={<ClaveInfo/>}/>
                    <Route path="nueva-clave" element={<NewClave/>}/>
                    {/*Admin Razones*/}
                    <Route path="razones" element={<Razones/>}/>
                    <Route path="razones/:id" element={<RazonInfo/>}/>
                    <Route path="nueva-razon" element={<NewRazon/>}/>
                    {/*Admin Prodcuts*/}
                    <Route path="products" element={<Products/>}/>
                    <Route path="products/:id" element={<ProductInfo/>}/>
                    <Route path="nuevo-producto" element={<NewProduct/>}/>
                    {/*Admin History/Tracks/Documents*/}
                    <Route path="historial" element={<History/>}/>
                    <Route path="traza" element={<Track/>}/>
                    <Route path="traza/:id" element={<Track/>}/>
                    <Route path="datos-nacional" element={<NewTraza/>}/>
                    <Route path="sellos" element={<Stamps/>}/>
                    <Route path="folios" element={<Folios/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App
