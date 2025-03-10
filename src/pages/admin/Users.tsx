import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";
import {Pagination} from "../../components/Pagination.tsx";
import {Search} from "../../components/Search.tsx";
import {useEffect, useState} from "react";
import {getAllUsers, getTotalUsers, PAGE_SIZE} from "../../api/users.ts";
import {UserType} from "../../api/types/user-types.ts";
import {Spinner} from "../../components/Spinner.tsx";

export const Users = () => {

    const [userList, setUserList] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    const handleClick = () => {
    }

    useEffect(() => {
        async function fetchAllUsers() {
            const allUsers = await getAllUsers(currentPage);
            if (allUsers) {
                setUserList(allUsers);
                setCurrentPage(0);
            }

            const totalUsers = await getTotalUsers();
            if (totalUsers) {
                setTotalUsers(totalUsers);
            }
        }

        if (window.location.pathname.includes("page")) {
            console.log(window.location.pathname);
        }

        fetchAllUsers().then(() => {
            setIsLoading(false);
        }).catch(console.error);
    }, [currentPage])

    return (
        <div className='h-[100%] content-center'>
            <Search/>
            <Container styles='my-3'>
                <Header title='Usuarios'/>
                <SubHeader titles={['Nombre', 'Activo']}/>
                {isLoading ? (<Spinner/>) :
                    <List isUser={true} elements={userList}/>}
            </Container>
            <Pagination currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        totalRecords={totalUsers}
                        onClick={() => handleClick()}/>
        </div>
    )
}
