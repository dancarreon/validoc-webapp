import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";
import {TrackType} from "../../api/types/traza-types.ts";
import {MouseEvent, useEffect, useState} from "react";
import {Spinner} from "../../components/Spinner.tsx";
import {ModelType} from "../../api/types/model-types.ts";
import {StatusType} from "../../api/types/status-type.ts";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'username', sort: 'asc'},
    {title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const History = () => {

    const [historyList, setHistoryList] = useState<TrackType[][]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;

        subheaderProps.forEach((prop) => {
            if (prop.dbProperty === orderBy) {
                prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
            }
        });

        setIsLoading(false);
    }

    function getHistoryList(): void {
        setIsLoading(true);

        const historyList = [];
        for (let j = 0; j < 4; j++) {

            const documents: TrackType[] = [];

            for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
                const document: TrackType = {
                    id: i + 1,
                    name: "Documento " + (i + 1),
                    status: (i % 2 === 0 ? StatusType.ACTIVE : StatusType.INACTIVE),
                };
                documents.push(document);
            }
            historyList.push(documents);
        }
        setHistoryList(historyList);

        setIsLoading(false);
    }

    useEffect(() => {
        getHistoryList();
    }, [])

    return (
        <div className='grid mt-3'>
            {historyList.map((history, index) => (
                <Container key={index}>
                    <Header title={'Track ' + index}/>
                    <SubHeader props={subheaderProps} onClick={(event) => handleSort(event)}/>
                    {
                        isLoading
                            ? <Spinner/>
                            : <List isUser={false} elements={{model: ModelType.TRACK, elements: history}}/>
                    }
                </Container>
            ))}
        </div>
    )
}
