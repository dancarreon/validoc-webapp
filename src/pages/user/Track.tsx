import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {StatusType} from "../../api/types/user-types.ts";
import {Steps} from "../../components/Steps.tsx";
import {useParams} from "react-router";
import {TrackType} from "../../api/types/traza-types.ts";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'username', sort: 'asc'},
    {title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Track = () => {

    const params = useParams();
    console.log(params)

    const documentList: TrackType[] =
        [{
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
        }]

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={4}/>
                <Header title='Track'/>
                <SubHeader props={subheaderProps}/>
                <List isUser={false} elements={documentList}/>
            </Container>
        </div>
    )
}
