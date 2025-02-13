import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {Steps} from "../../components/Steps.tsx";

export const Sellos = () => {
    return (
        <div className='h-[100vh] content-center'>
            <Container>
                <Steps step={2}/>
                <Header title='Sellos'/>
                <form onSubmit={e => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 1'/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 1'/>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 2'/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 2'/>
                    <TextInput type='text' placeholder='Litros Totales'/>
                    <TextInput type='text' placeholder='Precio/Lt Cliente'/>
                    <TextInput type='text' placeholder='Nombre Transportista'/>
                    <TextInput type='text' placeholder='Nombre Operador TRV'/>
                    <TextInput type='text' placeholder='Destino Mun/Estado'/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
