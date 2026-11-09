
import { Knob } from 'primereact/knob';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Link } from 'react-router';

import { DataSource } from 'src/components/DataSource';

const defaultProps = {
    apiPath: '',
    hasProgressView: false,
    link: '',
    title: '',
    description: '',
    icon: '',
    valuePrefix: '',
    valueSuffix: '',
    cardClass: '',
    minValue: 0,
    maxValue: 100
}

const RecordCount = (componentProps) => {

    const props = {
        ...defaultProps,
        ...componentProps
    }

    const { apiPath, hasProgressView, link, title, description, icon, valuePrefix, valueSuffix, cardClass, avatarClass, minValue, maxValue } = props;
    return (
        <DataSource apiPath={apiPath} showLoading={false}>
            {
                ({ response, loading, error }) => {
                    let displayValueTemplate
                    if (loading) {
                        displayValueTemplate = (<ProgressSpinner style={{ width: '30px', height: '30px' }} />)
                    }
                    else if (hasProgressView) {
                        let value = parseFloat(response);
                        let valueTemplate = `${valuePrefix}{value}${valueSuffix}`
                        displayValueTemplate = (<div className="text-center"><Knob readOnly valueColor={"accent"} rangeColor={"SlateGray"} min={minValue} max={maxValue} value={value} valueTemplate={valueTemplate} /></div>)
                    }
                    else {
                        displayValueTemplate = <div className="font-bold text-3xl">{valuePrefix}{response}{valueSuffix}</div>
                    }

                    return (
                        <Link to={link}>
                            <div className={`card flex flex-col gap-1 ${cardClass}`}>
                                <div className="flex gap-3 items-center justify-between">
                                    {title && <div className="text-xl font-bold">{title}</div>}
                                    {icon && <i className={icon} style={{ fontSize: '2rem' }} />}
                                </div>
                                {displayValueTemplate}
                                {description && <div className="text-gray-600 mt-2">{description}</div>}
                            </div>
                        </Link>
                    )
                }
            }
        </DataSource>
    )
}

export { RecordCount }