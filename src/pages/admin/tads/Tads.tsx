import {Header} from "../../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../../components/SubHeader.tsx";
import {List} from "../../../components/List.tsx";
import {Container} from "../../../components/Container.tsx";
import {Pagination} from "../../../components/Pagination.tsx";
import {Search} from "../../../components/Search.tsx";
import {MouseEvent, useEffect, useState} from "react";
import {TadType} from "../../../api/types/tad-types.ts";
import {Spinner} from "../../../components/Spinner.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {SearchType} from "../../../api/types/search-types.ts";
import {getAllTads, getTotalTads, PAGE_SIZE} from "../../../api/tads-api.ts";
import {getOrderAndSort} from "../../utils/utils.ts";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Ciudad', dbProperty: 'ciudad', sort: 'asc'},
    {title: 'Estado', dbProperty: 'estadoId', sort: 'asc'},
];

export const Tads = () => {
    const [tadList, setTadList] = useState<TadType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalTads, setTotalTads] = useState(0);

    const {register, handleSubmit, getValues} = useForm<SearchType>();

    async function doSearch(pageToGo: number, searchString: string): Promise<void> {
        setIsLoading(true);
        const tadsFound = await getAllTads(pageToGo, PAGE_SIZE, searchString);
        if (tadsFound) {
            setTadList(tadsFound);
        }

        const totalTadsFound = await getTotalTads(searchString);
        if (totalTadsFound) {
            setTotalTads(totalTadsFound);
            setCurrentPage(pageToGo);
        }
        setIsLoading(false);
    }

    async function fetchTadsCount(): Promise<void> {
        const totalTads = await getTotalTads();
        if (totalTads) {
            setTotalTads(totalTads);
        }
    }

    async function fetchAllTads(pageToGo: number) {
        setIsLoading(true);

        const orderAndSort = getOrderAndSort(subheaderProps);

        const allTads = await getAllTads(pageToGo, PAGE_SIZE, getValues('search'), orderAndSort);
        if (allTads) {
            setTadList(allTads);
            setCurrentPage(pageToGo);
        }

        await fetchTadsCount();
        setIsLoading(false);
    }

    const onSubmit: SubmitHandler<SearchType> = async (searchData: SearchType) => {
        await doSearch(0, searchData.search);
    };

    const handlePagination = async (e: MouseEvent<HTMLInputElement>) => {
        const pageToGo: number = Number(e.currentTarget.value);
        if (currentPage !== pageToGo) {
            if (getValues('search') === '') {
                await fetchAllTads(pageToGo);
            } else {
                await doSearch(pageToGo, getValues('search'));
            }
        }
    };

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;
        const orderAndSort = getOrderAndSort(subheaderProps);

        const allTads = await getAllTads(Number(currentPage), PAGE_SIZE, getValues('search'), orderAndSort);
        if (allTads) {
            setTadList(allTads);
            subheaderProps.forEach((prop) => {
                if (prop.dbProperty === orderBy) {
                    prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
                }
            });
        }

        await fetchTadsCount();
        setIsLoading(false);
    };

    useEffect(() => {
        if (tadList.length === 0) {
            fetchAllTads(0).catch(console.error);
        }
    }, [fetchAllTads, tadList.length]);

    return (
        <div className='h-[100%] content-center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Search {...register('search')} />
            </form>
            <Container styles='my-3'>
                <Header title='Tads'/>
                <SubHeader props={subheaderProps} onClick={(event) => handleSort(event)}/>
                {isLoading ? <Spinner/> : <List isUser={false} elements={{model: 'tad', elements: tadList}}/>}
            </Container>
            <Pagination
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalRecords={totalTads}
                onClick={(event) => handlePagination(event)}
            />
        </div>
    );
};
