import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";

export const Folios = () => {
    return (
        <div className='h-[100vh] content-center'>
            <Container>
                <Header title='Folios'/>
                <form onSubmit={e => e.preventDefault()} className='mt-5'>
                    <TextInput type='text' placeholder='Folio PEMEX 1'/>
                    <TextInput type='text' placeholder='Folio PEMEX 2'/>
                    <TextInput type='text' placeholder='Folio PEMEX 3'/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 1'/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 2'/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 3'/>
                    <TextInput type='text' placeholder='Folio Remisión Nacional'/>
                    <TextInput type='text' placeholder='Folio Fiscal Remisión Nacional'/>
                    <TextInput type='text' placeholder='Folio Trasvase'/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
