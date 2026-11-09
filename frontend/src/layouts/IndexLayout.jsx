import { Outlet } from 'react-router';
import { Avatar } from 'primereact/avatar';
import { Link } from 'react-router';

const IndexLayout = () => {
	
	const appName = import.meta.env.VITE_APP_NAME;
	return (
		<div>
			<div className="layout-topbar   shadow-7  ">
				<Link to="/" className="layout-topbar-logo">
						<Avatar image="/images/logo.png" alt="logo" size="large" />
						<strong>{ appName }</strong>

				</Link>
			</div>
			<div className="layout-main-container ">
				<div className="layout-main">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
export default IndexLayout;
