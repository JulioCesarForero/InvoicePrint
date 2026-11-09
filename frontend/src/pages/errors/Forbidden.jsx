
import React from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import useApp from 'hooks/useApp';
import { Divider } from 'primereact/divider';

const defaultProps = {
    message: "Access Forbidden"
}

const Forbidden = (componentProps) => {
    const props = {
        ...defaultProps,
        ...componentProps
    }
    const app = useApp()
    return (
        <div className="md:max-w-[40%] mx-auto card">
            <div className="flex flex-col gap-4 items-center">
                <div className="flex gap-4 items-center justify-center">
                    <Avatar size="xlarge" icon="pi pi-ban" />
                    <span className="text-pink-500 font-bold text-5xl">404</span>
                </div>
                {props.message && <div className="text-900 font-bold text-3xl">{props.message}</div>}
                <div className="text-gray-600 font-bold text-lg">You do not have the necessary permissions to access the resource. Please contact the Administrator for more information</div>
                <Divider />
                <div className="text-center">
                    <Button onClick={() => app.navigate('/home')} icon="pi pi-arrow-left" label="Home" />
                </div>
            </div>
        </div>
    )
}
export default Forbidden;