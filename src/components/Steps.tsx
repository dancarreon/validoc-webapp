export const Steps = ({step, trazaId}: {
    step: number,
    trazaId?: string,
}) => {

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const path: string = isAdmin ? "/admin" : "/user";

    return (
        <div className='pt-5 mb-4 w-full'>
            <ul className="steps text-sm w-full">
                <a href={path + '/traza' + (trazaId ? '/' + trazaId : '')}
                   className={'step ' + (step >= 1 ? 'step-primary' : '')}>
                    <li>
                        Datos
                    </li>
                </a>
                <a href={path + '/sellos' + (trazaId ? '/' + trazaId : '')}
                   className={'step ' + (step >= 2 ? 'step-primary' : '')}>
                    <li>
                        Sellos
                    </li>
                </a>
                <a href={path + '/folios' + (trazaId ? '/' + trazaId : '')}
                   className={'step ' + (step >= 3 ? 'step-primary' : '')}>
                    <li>
                        Folios
                    </li>
                </a>
                <a href={path + '/placas' + (trazaId ? '/' + trazaId : '')}
                   className={'step ' + (step >= 4 ? 'step-primary' : '')}>
                    <li>
                        Placas
                    </li>
                </a>
                <a href={path + '/docs' + (trazaId ? '/' + trazaId : '')}
                   className={'step ' + (step >= 5 ? 'step-primary' : '')}>
                    <li>
                        Docs
                    </li>
                </a>
            </ul>
        </div>
    )
}
