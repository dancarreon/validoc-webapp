import {SubHeader, SubHeaderProps} from "../../../components/SubHeader.tsx";
import {useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {getAllClaves, getTotalClaves} from "../../../api/claves-api.ts";
import {getOrderAndSort} from "../../utils/utils.ts";
import {List} from "../../../components/List.tsx";
import {ClaveType} from "../../../api/types/clave-types.ts";
import {SearchType} from "../../../api/types/search-types.ts";
import {PAGE_SIZE} from "../../../api/tads-api.ts";
import {Search} from "../../../components/Search.tsx";
import {Container} from "../../../components/Container.tsx";
import {Header} from "../../../components/Header.tsx";
import {Pagination} from "../../../components/Pagination.tsx";
import {Spinner} from "../../../components/Spinner.tsx";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Name', dbProperty: 'name', sort: 'asc'},
];

export const Claves = () => {
    const [claveList, setClaveList] = useState<ClaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalClaves, setTotalClaves] = useState(0);

    const {register, handleSubmit, getValues} = useForm<SearchType>();

    async function doSearch(pageToGo: number, searchString: string): Promise<void> {
        setIsLoading(true);
        const clavesFound = await getAllClaves(pageToGo, PAGE_SIZE, searchString);
        if (clavesFound) {
            setClaveList(clavesFound);
        }

        const totalClavesFound = await getTotalClaves(searchString);
        if (totalClavesFound) {
            setTotalClaves(totalClavesFound);
            setCurrentPage(pageToGo);
        }
        setIsLoading(false);
    }

    async function fetchClavesCount(): Promise<void> {
        const totalClaves = await getTotalClaves();
        if (totalClaves) {
            setTotalClaves(totalClaves);
        }
    }

    async function fetchAllClaves(pageToGo: number) {
        setIsLoading(true);

        const orderAndSort = getOrderAndSort(subheaderProps);

        const allClaves = await getAllClaves(pageToGo, PAGE_SIZE, getValues('search'), orderAndSort);
        if (allClaves) {
            setClaveList(allClaves);
            setCurrentPage(pageToGo);
        }

        await fetchClavesCount();
        setIsLoading(false);
    }

    const onSubmit: SubmitHandler<SearchType> = async (searchData: SearchType) => {
        await doSearch(0, searchData.search);
    };

    const handlePagination = async (e: MouseEvent<HTMLInputElement>) => {
        const pageToGo: number = Number(e.currentTarget.value);
        if (currentPage !== pageToGo) {
            if (getValues('search') === '') {
                await fetchAllClaves(pageToGo);
            } else {
                await doSearch(pageToGo, getValues('search'));
            }
        }
    };

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;
        const orderAndSort = getOrderAndSort(subheaderProps);

        const allClaves = await getAllClaves(Number(currentPage), PAGE_SIZE, getValues('search'), orderAndSort);
        if (allClaves) {
            setClaveList(allClaves);
            subheaderProps.forEach((prop) => {
                if (prop.dbProperty === orderBy) {
                    prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
                }
            });
        }

        await fetchClavesCount();
        setIsLoading(false);
    };

    useEffect(() => {
        if (claveList.length === 0) {
            fetchAllClaves(0).catch(console.error);
        }
    }, []);

    return (
        <div className='h-[100%] content-center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Search {...register('search')} />
            </form>
            <Container styles='my-3'>
                <Header title='Claves'/>
                <SubHeader props={subheaderProps} onClick={(event) => handleSort(event)}/>
                {isLoading ? <Spinner/> : <List isUser={false} elements={{model: 'clave', elements: claveList}}/>}
            </Container>
            <Pagination
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalRecords={totalClaves}
                onClick={(event) => handlePagination(event)}
            />
        </div>
    );
};
