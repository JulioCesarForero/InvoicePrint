import { Outlet } from 'react-router';
import { useState } from 'react';
import { AppMenu } from 'components/AppMenu';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { Link } from 'react-router';
import { TopMenuBar } from 'components/TopMenuBar';
import useApp from 'hooks/useApp';

const MainLayout = () => {
		const app = useApp();
	const appName = import.meta.env.VITE_APP_NAME;

	const [staticMenuInactive, setStaticMenuInactive] = useState(false);
	const [overlayMenuActive, setOverlayMenuActive] = useState(false);
	const [mobileMenuActive, setMobileMenuActive] = useState(false);
	const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
	let menuClick = false;
	let mobileTopbarMenuClick = false;
	const layoutMode = 'static';
	const isDesktop = () => {
		return window.innerWidth >= 992;
	}

	const onWrapperClick = (event) => {
		if (!menuClick) {
			setOverlayMenuActive(false);
			setMobileMenuActive(false);
		}

		if (!mobileTopbarMenuClick) {
			setMobileTopbarMenuActive(false);
		}

		mobileTopbarMenuClick = false;
		menuClick = false;
	}

	const onToggleMenuClick = (event) => {
		menuClick = true;
		if (isDesktop()) {
			if (layoutMode === 'overlay') {
				if (mobileMenuActive === true) {
					setOverlayMenuActive(true);
				}
				setOverlayMenuActive((prevState) => !prevState);
				setMobileMenuActive(false);
			}
			else if (layoutMode === 'static') {
				setStaticMenuInactive((prevState) => !prevState);
			}
		}
		else {
			setMobileMenuActive((prevState) => !prevState);
		}
		event.preventDefault();
	}

	const onSidebarClick = () => {
		menuClick = true;
	}
	const onMenuItemClick = (event) => {
		if (!event.item.items) {
			setOverlayMenuActive(false);
			setMobileMenuActive(false);
		}
	}
	const navbarSideLeft = app.menus.navbarSideLeft;
const navbarTopRight = app.menus.navbarTopRight;
	const wrapperClass = classNames('layout-wrapper', setContainerClass());

	function setContainerClass(){
		return {
			'layout-overlay': layoutMode === 'overlay',
			'layout-static': layoutMode === 'static',
			'layout-static-sidebar-inactive': staticMenuInactive && layoutMode === 'static',
			'layout-overlay-sidebar-active': overlayMenuActive && layoutMode === 'overlay',
			'layout-mobile-sidebar-active': mobileMenuActive,
			'p-input-filled': false
		}
	}
	return (
		<div className={wrapperClass} onClick={onWrapperClick}>
<div className="layout-topbar shadow-7">
    <Link to="/" className="layout-topbar-logo flex-grow-none gap-3 md:min-w-[200px]">
						<Avatar image="/images/logo.png" alt="logo" size="large" />
						<strong>{ appName }</strong>
        </Link>
        <div className="layout-toggle-menu mx-3">
            <Button icon="pi pi-bars" onClick={onToggleMenuClick} />
        </div>
        <div className="layout-topbar-menu flex grow-1 gap-2">
            <TopMenuBar menuItems={navbarTopRight} />
        </div>
    </div>
    <div className="layout-sidebar  nice-shadow-10" onClick={onSidebarClick}>
        <AppMenu model={navbarSideLeft} onMenuItemClick={onMenuItemClick} />
        </div>
			<div className="layout-main-container ">
				<div className="layout-main">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
export default MainLayout;
