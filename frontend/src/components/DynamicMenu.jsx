
import { Badge } from 'primereact/badge';
import { NavLink } from 'react-router';
import { DataSource } from 'src/components/DataSource';

const defaultProps = {
	apiPath: null,
	vertical: true,
}

const DynamicMenu = (componentProps) => {

	const props = { ...defaultProps, ...componentProps };

	const { apiPath, navLink, vertical } = props;

	if (apiPath) {
		if (vertical) {
			let linkClass = 'p-menuitem-link flex justify-content-between';
			let activeClass = linkClass + ' bg-primary text-white';
			return (
				<div className="p-menu p-component w-full">
					<ul className="p-menu-list">
						<DataSource apiPath={apiPath} itemTemplate={(item) => <li key={item.value} className="p-menuitem">
							<NavLink role="menuitem" to={navLink(item)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
								<span>{item.label}</span>
								{item.num && <Badge severity="secondary" value={item.num} />}
							</NavLink>
						</li>} />
					</ul>
				</div>
			);
		}
		else {
			let linkClass = 'p-button p-button-text p-button-plain';
			let activeClass = 'p-button p-button-primary';
			return (
				<DataSource apiPath={apiPath} itemTemplate={(item) => <NavLink key={item.value} to={navLink(item)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
					<span>{item.label}</span>
					{item.numd && <Badge severity="secondary" value={item.num} />}
				</NavLink>} />
			);
		}
	}
}

export { DynamicMenu }