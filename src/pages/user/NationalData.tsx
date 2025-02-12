import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";

export const NationalData = () => {
    return (
        <div className='h-[90vh] content-center'>
            <Container>
                <Header title='Datos Nacional'/>
                <form onSubmit={e => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='TAD Dirección'/>
                    <TextInput type='text' placeholder='Clave Concentradora'/>
                    <TextInput type='text' placeholder='Razón Social Comercial'/>
                    <TextInput type='text' placeholder='Producto'/>
                    <TextInput type='text' placeholder='Cap. Autotanque 1'/>
                    <TextInput type='text' placeholder='Cap. Autotanque 2'/>
                    <TextInput type='text' placeholder='Cap. Autotanque 3'/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
