import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Steps} from "../../components/Steps.tsx";
import {TrazaType} from "../../api/types/traza-types.ts";
import {useEffect, useState} from "react";
import {ModelType} from "../../api/types/model-types.ts";
import {StatusType} from "../../api/types/status-type.ts";
import {useParams} from "react-router";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'username', sort: 'asc'},
    {title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const TrazaDocs = () => {

    const [documentList, setDocumentList] = useState<TrazaType[]>([]);
    const params = useParams();

    useEffect(() => {
        setDocumentList([{
            id: '1',
            name: "Document 1",
            status: StatusType.INACTIVE,
        }, {
            id: '2',
            name: "Document 2",
            status: StatusType.INACTIVE,
        }, {
            id: '3',
            name: "Document 3",
            status: StatusType.INACTIVE,
        }])
    }, [])

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={5} trazaId={params.id}/>
                <Header title='Traza'/>
                <SubHeader props={subheaderProps}/>
                <List elements={{model: ModelType.TRACK, elements: documentList}}/>
            </Container>
        </div>
    )
}
