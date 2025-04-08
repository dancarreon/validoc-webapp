import {Header} from "../../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../../components/SubHeader.tsx";
import {List} from "../../../components/List.tsx";
import {Container} from "../../../components/Container.tsx";
import {Pagination} from "../../../components/Pagination.tsx";
import {Search} from "../../../components/Search.tsx";
import {MouseEvent, useEffect, useState} from "react";
import {getAllUsers, getTotalUsers, PAGE_SIZE} from "../../../api/users-api.ts";
import {UserType} from "../../../api/types/user-types.ts";
import {Spinner} from "../../../components/Spinner.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {SearchType} from "../../../api/types/search-types.ts";
import {getOrderAndSort} from "../../utils/utils.ts";

const subheaderProps: SubHeaderProps[] = [
    {title: 'Nombre', dbProperty: 'username', sort: 'asc'},
    {title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Users = () => {

    const [userList, setUserList] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    const {
        register,
        handleSubmit,
        getValues,
    } = useForm<SearchType>();

    async function doSearch(pageToGo: number, searchString: string): Promise<void> {
        setIsLoading(true);
        const usersFound = await getAllUsers(pageToGo, PAGE_SIZE, searchString);
        if (usersFound) {
            setUserList(usersFound);
        }

        const totalUsersFound = await getTotalUsers(searchString);
        if (totalUsersFound) {
            setTotalUsers(totalUsersFound);
            setCurrentPage(pageToGo);
        }
        setIsLoading(false);
    }

    async function fetchUsersCount(): Promise<void> {
        const totalUsers = await getTotalUsers();
        if (totalUsers) {
            setTotalUsers(totalUsers);
        }
    }

    async function fetchAllUsers(pageToGo: number) {
        setIsLoading(true);

        const orderAndSort = getOrderAndSort(subheaderProps);

        const allUsers = await getAllUsers(pageToGo, PAGE_SIZE, getValues('search'), orderAndSort);
        if (allUsers) {
            setUserList(allUsers);
            setCurrentPage(pageToGo);
        }

        await fetchUsersCount();
        setIsLoading(false);
    }

    const onSubmit: SubmitHandler<SearchType> = async (searchData: SearchType) => {
        await doSearch(0, searchData.search);
    }

    const handlePagination = async (e: MouseEvent<HTMLInputElement>) => {
        const pageToGo: number = Number(e.currentTarget.value);
        if (currentPage !== pageToGo) {
            // if search input is empty then proceed to move to the page requested
            if (getValues('search') === '') {
                await fetchAllUsers(pageToGo);
            } else {
                // else, re-do the search but with then page requested as query param
                await doSearch(pageToGo, getValues('search'));
            }
        }
    }

    const handleSort = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);

        const orderBy = e.currentTarget.name;
        const orderAndSort = getOrderAndSort(subheaderProps);

        const allUsers = await getAllUsers(Number(currentPage), PAGE_SIZE, getValues('search'), orderAndSort);
        if (allUsers) {
            setUserList(allUsers);
            subheaderProps.forEach((prop) => {
                if (prop.dbProperty === orderBy) {
                    prop.sort = prop.sort === 'asc' ? 'desc' : 'asc';
                }
            });
        }

        await fetchUsersCount();
        setIsLoading(false);
    }

    useEffect(() => {
        if (userList.length == 0) {
            fetchAllUsers(0).catch(console.error);
        }
    }, [])

    return (
        <div className='h-[100%] content-center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Search {...register('search')}/>
            </form>
            <Container styles='my-3'>
                <Header title='Usuarios'/>
                <SubHeader props={subheaderProps}
                           onClick={(event) => handleSort(event)}/>
                {
                    isLoading
                        ? <Spinner/>
                        : <List isUser={true} elements={{model: 'user', elements: userList}}/>
                }
            </Container>
            <Pagination currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        totalRecords={totalUsers}
                        onClick={(event) => handlePagination(event)}/>
        </div>
    )
}
