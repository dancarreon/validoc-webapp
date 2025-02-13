import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {TrazaType} from "../../api/types/types.tsx";
import {Steps} from "../../components/Steps.tsx";

export const Traza = () => {

    const documentList: TrazaType[] =
        [{
            id: 1,
            nombre: "Document 1",
            active: true,
        }, {
            id: 2,
            nombre: "Document 2",
            active: true,
        }, {
            id: 3,
            nombre: "Document 3",
            active: false,
        }]

    return (
        <div className='h-[90vh] content-center'>
            <Container>
                <Steps step={4}/>
                <Header title='Traza'/>
                <SubHeader titles={['Nombre', 'QR Activo']}/>
                <List elements={documentList}/>
            </Container>
        </div>
    )
}
