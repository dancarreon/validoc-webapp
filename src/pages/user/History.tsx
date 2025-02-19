import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";
import {StatusType, TrazaType} from "../../api/types/types.tsx";

export const History = () => {

    const historyList = [];

    for (let j = 0; j < 4; j++) {

        const documents: TrazaType[] = [];

        for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
            const document: TrazaType = {
                id: i + 1,
                name: "Documento " + (i + 1),
                status: (i % 2 === 0 ? StatusType.ACTIVE : StatusType.INACTIVE),
            };
            documents.push(document);
        }

        historyList.push(documents);
    }

    return (
        <div className='grid mt-3'>
            {historyList.map((history, index) => (
                <Container key={index}>
                    <Header title={'Traza ' + index}/>
                    <SubHeader titles={['Nombre', 'QR Activo']}/>
                    <List isUser={false} elements={history}/>
                </Container>
            ))}
        </div>
    )
}
