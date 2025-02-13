export const Steps = ({step}: { step: number }) => {

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const path = isAdmin ? "/admin" : "/user";

    return (
        <div className='pt-5 mb-4'>
            <ul className="steps text-sm">
                <li className={'step ' + (step >= 1 ? 'step-primary' : '')}>
                    <a href={path + '/datos-nacional'}>
                        Datos Nacional
                    </a>
                </li>
                <li className={'step ' + (step >= 2 ? 'step-primary' : '')}>
                    <a href={path + '/sellos'}>
                        Sellos
                    </a>
                </li>
                <li className={'step ' + (step >= 3 ? 'step-primary' : '')}>
                    <a href={path + '/folios'}>
                        Folios
                    </a>
                </li>
                <li className={'step ' + (step >= 4 ? 'step-primary' : '')}>
                    <a href={path + '/traza'}>
                        Traza
                    </a>
                </li>
            </ul>
        </div>
    )
}
