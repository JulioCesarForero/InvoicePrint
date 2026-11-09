import { Link } from 'react-router';
import { Button } from 'primereact/button';

export const TopMenuBar = (props) => {
    const { menuItems } = props;
    return (
        <>
            {
                menuItems &&
                menuItems.map((item, index) =>
                    <Link key={`top-left-menu-${index}`} to={item.to}>
                        <Button text label={item.label} icon={item.icon} className="page-button" />
                    </Link>
                )
            }
        </>
    );
}
