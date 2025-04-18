import {Container} from "../../components/Container.tsx";
import {ButtonWithIcon} from "../../components/ButtonWithIcon.tsx";
import {DocumentIcon} from "../../components/icons/DocumentIcon.tsx";
import {FolderIcon} from "../../components/icons/FolderIcon.tsx";

export const MenuUser = () => {
    return (
        <div className='h-[90vh] content-center'>
            <Container styles='grid'>
                <a href='/user/datos-nacional'>
                    <ButtonWithIcon title='Nueva Traza'>
                        <DocumentIcon/>
                    </ButtonWithIcon>
                </a>
                <a href='/user/historial'>
                    <ButtonWithIcon title='Historial'>
                        <FolderIcon/>
                    </ButtonWithIcon>
                </a>
            </Container>
        </div>
    )
}
