import {Search} from "../../components/Search.tsx";
import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {NewRecordButton} from "../../components/NewRecordButton.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {List, ListType} from "../../components/List.tsx";
import {Pagination} from "../../components/Pagination.tsx";
import {PAGE_SIZE} from "../../api/tads-api.ts";
import {MouseEvent, useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {SearchType} from "../../api/types/search-types.ts";
import {getOrderAndSort} from "../utils/utils.ts";
import {ModelType} from "../../api/types/model-types.ts";

export type PageProps<T> = {
    title: string,
    isUser?: boolean;
    newRecordPath: string;
    listType: { model: ModelType, elements: T[] } & ListType<T>;
    subheaderProps: SubHeaderProps[];
    searchApi: (pageToGo: number, PAGE_SIZE: number, searchString: string) => Promise<T[]>;
    getTotalApi: (searchString?: string) => Promise<number>;
    getAllApi: (pageToGo?: number, PAGE_SIZE?: number, searchString?: string, orderAndSort?: object[]) => Promise<T[]>;
};

export const PageListTemplate = <T extends object>({props}: { props: PageProps<T> }) => {

    const [recordList, setRecordList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [total, setTotal] = useState(0);

    const {register, handleSubmit, getValues} = useForm<SearchType>();

    async function doSearch(pageToGo: number, searchString: string): Promise<void> {
        setIsLoading(true);
        const searchResult = await props.searchApi(pageToGo, PAGE_SIZE, searchString);
        if (searchResult) {
            setRecordList(searchResult);
            props.listType.elements = searchResult;
        }

        await fetchTotalSearch(pageToGo, searchString);
        setIsLoading(false);
    }

    async function fetchTotalCount(): Promise<void> {
        const totalResults = await props.getTotalApi();
        if (totalResults) {
            setTotal(totalResults);
        }
    }

    async function fetchTotalSearch(pageToGo: number, searchString: string): Promise<void> {
        const totalResults = await props.getTotalApi(searchString);
        if (totalResults) {
            setTotal(totalResults);
            setCurrentPage(pageToGo);
        }
    }

    async function fetchAllRecords(pageToGo: number) {
        setIsLoading(true);

        const orderAndSort = getOrderAndSort(props.subheaderProps);

        const allRecords: T[] = await props.getAllApi(pageToGo, PAGE_SIZE, getValues('search'), orderAndSort);
        if (allRecords) {
            setRecordList(allRecords);
            setCurrentPage(pageToGo);
            props.listType.elements = allRecords;
        }

        await fetchTotalCount();
        setIsLoading(false);
    }

    const onSubmit: SubmitHandler<SearchType> = async (searchData: SearchType) => {
        await doSearch(0, searchData.search);
    };

    const handlePagination = async (e: MouseEvent<HTMLInputElement>) => {
        const pageToGo: number = Number(e.currentTarget.value);
        if (currentPage !== pageToGo) {
            if (getValues('search') === '') {
                await fetchAllRecords(pageToGo);
            } else {
                await doSearch(pageToGo, getValues('search'));

            }
        }
    };

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;
        const orderAndSort = getOrderAndSort(props.subheaderProps);

        const allRecords = await props.getAllApi(Number(currentPage), PAGE_SIZE, getValues('search'), orderAndSort);
        if (allRecords) {
            setRecordList(allRecords);
            props.subheaderProps.forEach((prop) => {
                if (prop.dbProperty === orderBy) {
                    prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
                }
            });
            props.listType.elements = allRecords;
        }

        if (getValues('search') === '') {
            await fetchTotalCount();
        } else {
            await fetchTotalSearch(currentPage, getValues('search'));
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (recordList.length === 0) {
            fetchAllRecords(0).catch(console.error);
        }
    }, []);

    return (
        <div className='h-[100%] content-center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Search {...register('search')} />
            </form>
            <Container styles='my-3'>
                <Header title={props.title}>
                    <NewRecordButton path={props.newRecordPath}/>
                </Header>
                <SubHeader props={props.subheaderProps} onClick={(event) => handleSort(event)}/>
                {
                    isLoading
                        ? <Spinner/>
                        : <List elements={props.listType} cols={props.subheaderProps.length}/>
                }
            </Container>
            <Pagination
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalRecords={total}
                onClick={(event) => handlePagination(event)}
            />
        </div>
    );
}
