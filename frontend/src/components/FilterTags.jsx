import React from 'react';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';


const defaultProps = {
	pageFilterController: {},
	tagClassName: 'flex card justify-content-between align-items-center surface-card pl-3 p-1 py-1 text-500 text-center mb-3 mr-2',
}

const FilterTags = (componentProps) => {
	const props = { ...defaultProps, ...componentProps };
	const { filterController, tagClassName } = props;
	const { filters, removeFilter, filterHasValue, getFilterValue } = filterController;
	const tagTemplate = (key, filter) => {
		if (filter.valueType === 'multiple' || filter.valueType === 'multiple-date') {
			return (
				<>
					<span>{filter.tagTitle}:</span>
					{filter.value.map((val) =>
						<Chip label={getFilterValue(filter, val)} key={val} className="ml-2" removable onRemove={() => removeFilter(key, val)} />)
					}
				</>
			);
		}
		else {
			return (
				<>
					<span>{filter.tagTitle}:</span>
					<strong className="text-primary ml-2">{getFilterValue(filter)}</strong>
					<Button onClick={() => removeFilter(key)} className="p-button-sm p-button-text p-button-plain" icon="pi pi-times" />
				</>
			);
		}
	}
	return (
		<div className="flex flex-wrap">
			{
				Object.entries(filters).map(([key, filter]) => (
					<React.Fragment key={key}>
						{filterHasValue(key) &&
							<div className={tagClassName}>
								{tagTemplate(key, filter)}
							</div>
						}
					</React.Fragment>
				))
			}
		</div>
	)
}

export { FilterTags }