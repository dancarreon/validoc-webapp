import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";

export const History = () => {

    const historyList = [];

    for (let j = 0; j < 4; j++) {

        const documents = [];

        for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
            const document = {
                id: i + 1,
                nombre: "Documento " + (i + 1),
                active: (i % 2 === 0),
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
                    <List elements={history}/>
                </Container>
            ))}
        </div>
    )
}
