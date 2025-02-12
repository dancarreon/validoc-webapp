import {Container} from "../../components/Container";
import {ButtonWithIcon} from "../../components/ButtonWithIcon.tsx";
import {DocumentIcon} from "../../components/icons/DocumentIcon.tsx";
import {FolderIcon} from "../../components/icons/FolderIcon.tsx";
import {UserIcon} from "../../components/icons/UserIcon.tsx";

export const MenuAdmin = () => {
    return (
        <div className='h-[90vh] content-center mt-3'>
            <Container styles='grid'>
                <a href='/admin/datos-nacional'>
                    <ButtonWithIcon title='Nueva Traza'>
                        <DocumentIcon/>
                    </ButtonWithIcon>
                </a>
                <a href='/admin/historial'>
                    <ButtonWithIcon title='Historial'>
                        <FolderIcon/>
                    </ButtonWithIcon>
                </a>
                <a href='/admin/usuarios'>
                    <ButtonWithIcon title='Usuarios'>
                        <UserIcon/>
                    </ButtonWithIcon>
                </a>
            </Container>
        </div>
    )
}
