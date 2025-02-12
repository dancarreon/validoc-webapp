import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {User} from "../../api/types/types.tsx";

export const UserInfo = ({user}: { user?: User }) => {

    user = {
        nombre: "Capitoil",
        password: "123456",
    } as User;

    return (
        <div className='h-[90vh] content-center'>
            <Container>
                <Header title={user.nombre}/>
                <form onSubmit={(e) => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='Nombre de Usuario' value={user.nombre}/>
                    <TextInput type='text' placeholder='Contraseña' value={user.password}/>
                    <Button label='Guardar'/>
                    <Button styles='bg-black' label='Desactivar'/>
                </form>
            </Container>
        </div>
    )
}
