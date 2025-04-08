import {Header} from "../../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../../components/SubHeader.tsx";
import {List} from "../../../components/List.tsx";
import {Container} from "../../../components/Container.tsx";
import {Pagination} from "../../../components/Pagination.tsx";
import {Search} from "../../../components/Search.tsx";
import {MouseEvent, useEffect, useState} from "react";
import {getAllStates, getTotalStates, PAGE_SIZE} from "../../../api/states-api.ts";
import {StateType} from "../../../api/types/state-types.ts";
import {Spinner} from "../../../components/Spinner.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {SearchType} from "../../../api/types/search-types.ts";
import {getOrderAndSort} from "../../utils/utils.ts";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'name', sort: 'asc'},
];

export const States = () => {

    const [stateList, setStateList] = useState<StateType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalStates, setTotalStates] = useState(0);

    const {
        register,
        handleSubmit,
        getValues,
    } = useForm<SearchType>();

    async function doSearch(pageToGo: number, searchString: string): Promise<void> {
        setIsLoading(true);
        const statesFound = await getAllStates(pageToGo, PAGE_SIZE, searchString);
        if (statesFound) {
            setStateList(statesFound);
        }

        const totalStatesFound = await getTotalStates(searchString);
        if (totalStatesFound) {
            setTotalStates(totalStatesFound);
            setCurrentPage(pageToGo);
        }
        setIsLoading(false);
    }

    async function fetchStatesCount(): Promise<void> {
        const totalStates = await getTotalStates();
        if (totalStates) {
            setTotalStates(totalStates);
        }
    }

    async function fetchAllStates(pageToGo: number) {
        setIsLoading(true);

        const orderAndSort = getOrderAndSort(subheaderProps);

        const allStates = await getAllStates(pageToGo, PAGE_SIZE, getValues('search'), orderAndSort);
        if (allStates) {
            setStateList(allStates);
            setCurrentPage(pageToGo);
        }

        await fetchStatesCount();
        setIsLoading(false);
    }

    const onSubmit: SubmitHandler<SearchType> = async (searchData: SearchType) => {
        await doSearch(0, searchData.search);
    }

    const handlePagination = async (e: MouseEvent<HTMLInputElement>) => {
        const pageToGo: number = Number(e.currentTarget.value);
        if (currentPage !== pageToGo) {
            if (getValues('search') === '') {
                await fetchAllStates(pageToGo);
            } else {
                await doSearch(pageToGo, getValues('search'));
            }
        }
    }

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;
        const orderAndSort = getOrderAndSort(subheaderProps);

        const allStates = await getAllStates(Number(currentPage), PAGE_SIZE, getValues('search'), orderAndSort);
        if (allStates) {
            setStateList(allStates);
            subheaderProps.forEach((prop) => {
                if (prop.dbProperty === orderBy) {
                    prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
                }
            });
        }

        await fetchStatesCount();
        setIsLoading(false);
    }

    useEffect(() => {
        if (stateList.length == 0) {
            fetchAllStates(0).catch(console.error);
        }
    }, [])

    return (
        <div className='h-[100%] content-center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Search {...register('search')}/>
            </form>
            <Container styles='my-3'>
                <Header title='Estados'/>
                <SubHeader props={subheaderProps}
                           onClick={(event) => handleSort(event)}/>
                {
                    isLoading
                        ? <Spinner/>
                        : <List isUser={false} elements={{model: 'states', elements: stateList}}/>
                }
            </Container>
            <Pagination currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        totalRecords={totalStates}
                        onClick={(event) => handlePagination(event)}/>
        </div>
    )
}
