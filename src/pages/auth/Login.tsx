import {Container} from "../../components/Container";
import {Logo} from "../../components/Logo";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button";
import {useNavigate} from "react-router";

export const Login = () => {

    const navigate = useNavigate();

    async function submit(formData: FormData) {
        const query = formData.get('usuario');
        if (query) {
            if (query.toString().toLowerCase() === 'user') {
                navigate('/user');
            } else if (query.toString().toLowerCase() === 'admin') {
                navigate('/admin');
            }
        }
    }

    return (
        <div className='h-[100vh] content-center'>
            <Container styles='m-auto pb-7'>
                <Logo/>
                <form action={submit}>
                    <TextInput name='usuario' placeholder={'Usuario'}/>
                    <TextInput type={'password'} name='password' placeholder={'Contraseña'}/>
                    <Button type='submit' label={'Ingresar'}/>
                </form>
            </Container>
        </div>
    )
}
