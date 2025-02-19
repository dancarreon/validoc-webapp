import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {UserType} from "../../api/types/types.tsx";

export const UserInfo = ({user}: { user?: UserType }) => {

    user = {
        username: "Capitoil",
        password: "123456",
    } as UserType;

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Header title={user.username}/>
                <form onSubmit={(e) => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='Nombre de Usuario' value={user.username}/>
                    <TextInput type='text' placeholder='Contraseña' value={user.password}/>
                    <Button label='Guardar'/>
                    <Button styles='bg-black ml-1' label='Desactivar'/>
                </form>
            </Container>
        </div>
    )
}
