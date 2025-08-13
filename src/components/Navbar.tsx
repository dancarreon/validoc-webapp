import logo from "../assets/validoc.png";

export const Navbar = ({isAdmin}: { isAdmin?: boolean }) => {

	const prefix = isAdmin ? 'admin' : 'user';

	return (
		<div className="navbar bg-black shadow-sm p-0 sticky top-0 z-50 h-[65px]">
			<div className="flex-1 text-left hover:bg-black">
				<a className="inline-flex outline-black outline-none btn-shadown-black bg-black border-none text-xl ml-5 mt-2"
				   href={'/' + prefix}>
					<img src={logo} alt="ValiDoc" className='h-[40px]'/>
					<div className='ml-1 mt-0.5 bg-black border-none w-full text-[24px] font-bold font-sans'>ValiDoc
					</div>
				</a>
			</div>
			<div className="flex text-right">
				<ul className="menu menu-horizontal">
					<li className='w-[180px]'>
						<details>
							<summary className='flex justify-end'>Menu</summary>
							<ul className="bg-black rounded-t-none w-full">
								<li><a href={'/' + prefix + '/traza'}>Nueva Traza</a></li>
								<li><a href={'/' + prefix + '/historial'}>Trazas</a></li>
								<li><a href={'/' + prefix + '/excel'}>Importar Excel</a></li>
								<hr/>
								{isAdmin && (<li><a href={'/' + prefix + '/usuarios'}>Usuarios</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/tads'}>TADs</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/claves'}>Claves</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/estados'}>Estados</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/products'}>Productos</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/razones'}>Razones</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/transportistas'}>Transportistas</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/clientes'}>Clientes</a></li>)}
								{isAdmin && (<li><a href={'/' + prefix + '/pdfs'}>Plantillas PDF</a></li>)}
								<li className='bg-[#EC3113]'>
									<a href={'/'}>Salir</a>
								</li>
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</div>
	)
}
