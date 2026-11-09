
import { useState, useEffect } from "react";
import useUtils from 'hooks/useUtils';
import useLocalStore from 'hooks/useLocalStore';

const useFilters = ({ props, filterSchema, debounceTime = 500 }) => {
	const utils = useUtils();
	const localStore = useLocalStore();
	const storeState = localStore.getPageData(props.pageName) || {};
	const savedFilters = storeState.filters || {};
	const queryParams = {}

	restoreFilterState()

	const [filters, setFilters] = useState(filterSchema);
	const [filterParams, setFilterParams] = useState(queryParams);

	function setFilterValue(field, value) {
		const filter = filters[field];
		filter.value = value;
		
		setFilters(prev => ({
			...prev,
			[field]: filter
		}));

	}

	function setFilterOptions(field, options) {
		const filter = filters[field]
		filter.options = options;
		setFilters(prev => ({
			...prev,
			[field]: filter
		}));
	}

	function computeFilterValues() {
		const values = []
		for (const [key, filter] of Object.entries(filters)) {
			const value = filter.value || '';
			values.push(value.toString());
		}
		return values.join("");
	}

	const filterValues = computeFilterValues();
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			buildFilterParams();
		}, debounceTime);
		return () => clearTimeout(delayDebounceFn)
	}, [filterValues]);

	function restoreFilterState() {
		if (!props.isSubPage) {
			for (const [key, value] of Object.entries(savedFilters)) {
				try {
					const filter = filterSchema[key];
					const valueType = filter.valueType;
					let filterValue = null;
					if (valueType == 'single') {
						filterValue = value.toString();
					}
					else if (valueType === 'range') {
						const { min, max } = value || {};
						if (min && max) {
							filterValue = [min, max];
						}
					}
					else if (valueType === 'multiple') {
						if (Array.isArray(value)) {
							filterValue = value
						}
					}
					else if (valueType === 'range-date') {
						const { from, to } = value || {};
						if (from && to) {
							const fromDate = new Date(from)
							const toDate = new Date(to)
							filterValue = [fromDate, toDate];
						}
					}
					else if (valueType === 'single-date') {
						filterValue = new Date(value)
					}
					else if (valueType === 'multiple-date') {
						if (Array.isArray(value)) {
							filterValue = value.map((dateStr) => new Date(dateStr))
						}
					}
					filter.value = filterValue;
					queryParams[key] = value;
				}
				catch (e) {
					console.error(e);
				}
			}
		}
	}

	//build filter params from current filter state
	function buildFilterParams() {
		const query = {};
		for (const [key, filter] of Object.entries(filters)) {
			if (filterHasValue(key)) {
				if (filter.valueType === 'range') {
					query[key] = { min: filter.value[0], max: filter.value[1] };
				}
				else if (filter.valueType === 'range-date') {
					const fromDate = utils.formatDate(filter.value[0]);
					const toDate = utils.formatDate(filter.value[1]);
					query[key] = { from: fromDate, to: toDate };
				}
				else if (filter.valueType === 'multiple-date') {
					query[key] = filter.value.map((val) => utils.formatDate(val));
				}
				else if (filter.valueType === 'single-date') {
					query[key] = utils.formatDate(filter.value);
				}
				else {
					query[key] = filter.value;
				}
			}
		}
		setFilterParams(query)
	}

	function removeFilter(fieldname, selectedVal) {
		const filter = filters[fieldname];
		if (filter) {
			const valueType = filter.valueType;
			if (valueType == 'single') {
				filter.value = '';
			}
			else if (valueType === 'range') {
				filter.value = null;
			}
			else if (valueType === 'range-date') {
				filter.value = [];
			}
			else if (valueType === 'single-date') {
				filter.value = null;
			}
			else if (valueType === 'multiple' || valueType === 'multiple-date') {
				let idx = filter.value.indexOf(selectedVal);
				filter.value.splice(idx, 1);
			}
			setFilters(prev => ({
				...prev,
				[fieldname]: filter
			}));
		}
	}

	function filterHasValue(field) {
		try {
			const filter = filters[field];
			if (filter) {
				if (filter.valueType === 'range') {
					return filter?.value?.length > 0;
				}
				else if (filter.valueType === 'range-date') {
					if (filter.value?.length > 1) {
						const toDate = filter.value[1] || null;
						if (toDate) return true; //if second date has been selected
					}
					return false;
				}
				else if (Array.isArray(filter.value)) {
					return filter.value.length > 0;
				}
				else if (filter.value) {
					return true;
				}
			}
		}
		catch (e) {
			console.error(e);
		}
		return false;
	}

	function getFilterValue(filter, selectedVal) {
		if (filter) {
			if (filter.valueType === 'range' && filter.value.length) {
				let min = filter.value[0];
				let max = filter.value[1];
				return `${min} - ${max}`;
			}
			else if (filter.valueType === 'range-date' && filter.value.length) {
				let minDate = utils.humanDate(filter.value[0]);
				let maxDate = utils.humanDate(filter.value[1]);
				return `${minDate} - ${maxDate}`;
			}
			else if (filter.valueType === 'multiple-date') {
				let val = selectedVal || filter.value;
				return utils.humanDate(val);
			}
			else if (filter.valueType === 'single-date') {
				return utils.humanDate(filter.value);
			}
			else if (filter.options.length) {
				let val = selectedVal || filter.value;
				let selectedFilter = filter.options.find(obj => obj.value == val);
				if (selectedFilter) {
					return selectedFilter.label;
				}
			}
			else if (selectedVal) {
				return selectedVal.toString();
			}
			return filter.value;
		}
		return "";
	}


	return {
		filterValues,
		filterSchema,
		filters,
		setFilterValue,
		setFilterOptions,
		removeFilter,
		filterHasValue,
		getFilterValue,
		filterParams
	};
}
export default useFilters