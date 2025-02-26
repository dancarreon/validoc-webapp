import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";
import {Pagination} from "../../components/Pagination.tsx";
import {Search} from "../../components/Search.tsx";
import {useEffect, useState} from "react";
import {getAllUsers} from "../../api/users.ts";
import {UserType} from "../../api/types/user-types.ts";

export const Users = () => {

    const [userList, setUserList] = useState<UserType[]>([]);

    useEffect(() => {
        getAllUsers().then((response) => setUserList(response));
    }, [])

    return (
        <div className='h-[100%] content-center'>
            <Search/>
            <Container styles='my-3'>
                <Header title='Usuarios'/>
                <SubHeader titles={['Nombre', 'Activo']}/>
                <List isUser={true} elements={userList}/>
            </Container>
            <Pagination currentPage={2}/>
        </div>
    )
}
