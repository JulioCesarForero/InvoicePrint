import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

const defaultProps = {
    items: [],
    dropIcon: "pi pi-bars",
    buttonText: '',
    buttonTitle: '',
    flat: true,
    severity: '',
}

export function PopupMenu(componentProps) {
    const props = { ...defaultProps, ...componentProps };

    const menuRight = useRef(null);

    const items = props.items || [];

    if (items.length === 0) {
        return <></>;
    }

    return (
        <>
            <Menu model={items} popup ref={menuRight} id="popup_menu_right" />
            <Button label={props.buttonLabel} title={props.buttonTitle} severity={props.severity} text={props.flat} icon={props.dropIcon} onClick={(event) => menuRight.current.toggle(event)} aria-controls="popup_menu_right" aria-haspopup />
        </>
    );
}