


import React, { useEffect, useState } from "react";
import { SplitButton } from 'primereact/splitbutton';
import useApp from 'src/hooks/useApp';
import useLocalStore from 'src/hooks/useLocalStore';
export function LangSwitcher(props) {
    const app = useApp();
    const locales = app?.menus?.locales;
    const localStore = useLocalStore();
    const [localeMenuItems, setLocaleMenuItems] = useState([]);
    const [localName, setLocaleName] = useState('');
    function setMenuItems() {
        let menus = []
        for (let [key, value] of Object.entries(locales)) {
            menus.push({
                label: value,
                command: () => { changeLocale(key) }
            });
        }
        setLocaleMenuItems(menus);
    }

    useEffect(() => {
        setMenuItems();
        const localeShortName = app.localeName;
        let fullName = locales[localeShortName] || localeShortName;
        setLocaleName(fullName);
    }, [locales])

    function changeLocale(locale) {
        localStore.setLocale(locale);
        window.location.reload();
    }

    return (<SplitButton label={localName} model={localeMenuItems} />)
}