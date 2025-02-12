import {Container} from "../../components/Container";
import {Logo} from "../../components/Logo";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button";

export const Login = () => {
    return (
        <div className='h-[100vh] content-center'>
            <Container styles='m-auto'>
                <Logo/>
                <TextInput type={'text'} placeholder={'Usuario'}/>
                <TextInput type={'password'} placeholder={'Contraseña'}/>
                <Button label={'Ingresar'}/>
            </Container>
        </div>
    )
}
