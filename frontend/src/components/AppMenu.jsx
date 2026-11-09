import React, { useState } from 'react';
import { NavLink } from 'react-router';
import classNames from 'classnames';
import { Ripple } from "primereact/ripple";
import { Badge } from 'primereact/badge';


const AppSubmenu = (props) => {

    const [activeIndex, setActiveIndex] = useState(null)

    const onMenuItemClick = (event, item, index) => {
        //avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        //execute command
        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (index === activeIndex)
            setActiveIndex(null);
        else
            setActiveIndex(index);

        if (props.onMenuItemClick) {
            props.onMenuItemClick({
                originalEvent: event,
                item: item
            });
        }
    }

    const onKeyDown = (event) => {
        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            event.target.click();
        }
    }

    function itemVisible(item) {
        const visible = (typeof item.visible === 'function' ? item.visible() : item.visible !== false);
        return visible
    }

    const renderLinkContent = (item) => {
        let submenuIcon = item.items && <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>;
        let badge = item.badge && <Badge value={item.badge} />;
        let menuIcon = item.icon && <i className={`menu-icon ${item.icon}`}></i>;
        let menuLabel = item.label && <span className="menu-label">{item.label}</span>
        return (
            <React.Fragment>
                {menuIcon}
                {menuLabel}
                {submenuIcon}
                {badge}
                <Ripple />
            </React.Fragment>
        );
    }

    const renderLink = (item, i) => {
        let content = renderLinkContent(item);
        if (!itemVisible(item)) {
            return null;
        }
        if (item.to) {
            return (
                <NavLink className={({ isActive }) => (isActive ? 'p-ripple router-link-active router-link-exact-active' : 'p-ripple')} aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" to={item.to} onClick={(e) => onMenuItemClick(e, item, i)} exact="true" target={item.target}>
                    {content}
                </NavLink>
            )
        }
        else {
            return (
                <a tabIndex="0" aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" href={item.url} className="p-ripple" onClick={(e) => onMenuItemClick(e, item, i)} target={item.target}>
                    {content}
                </a>
            );
        }
    }

    let items = props.items && props.items.map((item, i) => {
        let active = activeIndex === i;
        let styleClass = classNames(item.badgeStyleClass, { 'layout-menuitem-category': props.root, 'active-menuitem': active && !item.to });

        if (props.root) {
            return (
                <li className={styleClass} key={i} role="none">
                    {props.root === true && <>
                        <div className="layout-menuitem-root-text" aria-label={item.label}>{item.label}</div>
                        <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </>}
                </li>
            );
        }
        else {
            return (
                <li className={styleClass} key={i} role="none">
                    {renderLink(item, i)}
                    <div className="layout-submenu-wrapper">
                        <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </div>
                </li>
            );
        }
    });

    return items ? <ul className={props.className} role="menu">{items}</ul> : null;
}

export const AppMenu = (props) => {
    return (
        <div className="layout-menu-container">
            <AppSubmenu items={props.model} className="layout-menu" onMenuItemClick={props.onMenuItemClick} role="menu" />
        </div>
    );
}

