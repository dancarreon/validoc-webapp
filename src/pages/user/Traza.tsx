import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {StatusType, TrazaType} from "../../api/types/types.tsx";
import {Steps} from "../../components/Steps.tsx";

export const Traza = () => {

    const documentList: TrazaType[] =
        [{
            id: 1,
            username: "Document 1",
            status: StatusType.INACTIVE,
        }, {
            id: 2,
            username: "Document 2",
            status: StatusType.INACTIVE,
        }, {
            id: 3,
            username: "Document 3",
            status: StatusType.INACTIVE,
        }]

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={4}/>
                <Header title='Traza'/>
                <SubHeader titles={['Nombre', 'QR Activo']}/>
                <List isUser={false} elements={documentList}/>
            </Container>
        </div>
    )
}
