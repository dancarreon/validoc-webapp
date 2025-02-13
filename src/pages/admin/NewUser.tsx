import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";

export const NewUser = () => {
    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Header title='Nuevo Usuario'/>
                <form onSubmit={(e) => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='Nombre de Usuario'/>
                    <TextInput type='text' placeholder='Contraseña'/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
