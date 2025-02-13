import {Header} from "../../components/Header.tsx";
import {SubHeader} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Container} from "../../components/Container.tsx";
import {Pagination} from "../../components/Pagination.tsx";

export const Users = () => {

    const userList = []

    for (let i = 0; i < 10; i++) {
        const user = {
            id: i + 1,
            nombre: "Usuario " + (i + 1),
            active: (i % 2 === 0),
            password: String((i * Math.random())),
        };
        userList.push(user);
    }

    return (
        <div className='h-[100%] content-center'>
            <Container styles='my-3'>
                <Header title='Usuarios'/>
                <SubHeader titles={['Nombre', 'Activo']}/>
                <List elements={userList}/>
            </Container>
            <Pagination currentPage={2}/>
        </div>
    )
}
