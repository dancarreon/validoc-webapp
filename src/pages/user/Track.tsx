import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {StatusType} from "../../api/types/user-types.ts";
import {Steps} from "../../components/Steps.tsx";
import {TrackType} from "../../api/types/traza-types.ts";
import {useEffect, useState} from "react";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'username', sort: 'asc'},
    {title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Track = () => {

    const [documentList, setDocumentList] = useState<TrackType[]>([]);

    useEffect(() => {
        setDocumentList([{
            id: 1,
            name: "Document 1",
            status: StatusType.INACTIVE,
        }, {
            id: 2,
            name: "Document 2",
            status: StatusType.INACTIVE,
        }, {
            id: 3,
            name: "Document 3",
            status: StatusType.INACTIVE,
        }])
    }, [])

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={4}/>
                <Header title='Track'/>
                <SubHeader props={subheaderProps}/>
                <List isUser={false} elements={{model: Model.TRACK, elements: documentList}}/>
            </Container>
        </div>
    )
}
