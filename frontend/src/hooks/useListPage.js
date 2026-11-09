/**
 * @Category React hook function
 * List page hook. 
 * Provide list page state and functions
 * 
**/
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams } from 'react-router';
import { useQueryClient, useQuery} from '@tanstack/react-query';
import { confirmDialog } from 'primereact/confirmdialog';

import useUtils from 'hooks/useUtils';
import useApp from 'hooks/useApp';
import useApi from 'hooks/useApi';
import useFilters from 'hooks/useFilters';
import useLocalStore from 'hooks/useLocalStore';

const useListPage = (props, filterSchema = {}) => {
	const app = useApp();
	const api = useApi();
	const utils = useUtils();
	const localStore = useLocalStore();
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();
	const filterController = useFilters({ props, filterSchema });
	let { filterParams } = filterController;
	const filterParamStr = utils.serializeQuery(filterParams);
	let { fieldName, fieldValue } = useParams();
	if (props.fieldName && props.fieldValue !== null) {
		fieldName = props.fieldName;
		fieldValue = props.fieldValue;
	}
	let orderBy = props.sortField;
	let orderType = props.sortDir;
	let pageNo = props.pageNo || 1;
	let pageLimit = props.limit || 10;
	if (!props.isSubPage) {
		restorePageState();
	}
	// compute current page offset
	const offset = useMemo(() => (pageNo - 1) * pageLimit, [pageNo, pageLimit]);
	const [firstRow, setFirstRow] = useState(offset);
	const [currentPage, setCurrentPage] = useState(pageNo);
	const [expandedRows, setExpandedRows] = useState(null);
	const [limit, setLimit] = useState(pageLimit);
	const [sortBy, setSortBy] = useState(orderBy);
	const [sortType, setSortType] = useState(orderType);
	const [sortOrder, setSortOrder] = useState(1);
	const [pageReady, setPageReady] = useState(false);
	const [singleSelect, setSingleSelect] = useState(true);
	const [selectedItems, setSelectedItems] = useState([]);
	const [records, setRecords] = useState([]);
	const [resetRecords, setResetRecords] = useState(false);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [recordCount, setRecordCount] = useState(0);
	const pageParams = { page: currentPage, limit };
	const apiUrl = useMemo(() => buildApiUrl(),
		[filterParamStr, limit, currentPage, sortBy, sortType, fieldName, fieldValue]
	);

	const cacheTime = (props.keepRecords ? 0 : 50000);
	const { isLoading, isError, data, error } = useQuery(
		{
			queryKey: [props.pageName, apiUrl],
			queryFn: fetchRecords,
			cacheTime,
			retry: false,
		}
	);

	// compute record  position
	const recordsPosition = useMemo(() =>
		Math.min(currentPage * limit, totalRecords),
		[currentPage, limit]
	);
	// check if api has reached the last record
	const finishedLoading = (recordCount < limit && records.length > 0);
	// check if api has more data to fetch
	const canLoadMore = (!isLoading && !finishedLoading);
	useEffect(() => {
		setCurrentPage(pageNo);
		setLimit(pageLimit);
		setFirstRow(offset);
	}, [pageNo, pageLimit]);
	// this effect runs when data from api changes
	useEffect(() => {
		function setPageData() {
			if (data) {
				if (data?.records) {
					if (props.keepRecords && !resetRecords) {
						setRecords([...records, ...data.records]);
					}
					else {
						setRecords(data.records);
					}
					setTotalPages(data?.totalPages);
					setTotalRecords(data?.totalRecords);
					setRecordCount(data?.recordCount);
					setResetRecords(false);
				}
				else {
					setRecords(data);
				}
				setPageReady(true);
			}
		}
		setPageData();
	}, [data, isError]);

	// clear page data on request error
	useEffect(() => {
		localStore.clearPageData(props.pageName);
   }, [error]);

	// reset pagination state when records filters change
	useEffect(() => {
		if (filterParamStr || fieldName || fieldValue) {
			resetPagination();
		}
	}, [fieldName, fieldValue, filterParamStr]);
	// make axio request to the api
	function fetchRecords() {
		if (apiUrl) {
			return api.get(apiUrl).then((res) => res?.data);
		}
		return Promise.resolve(null);
	}
	//compute api url using current page state
	function buildApiUrl() {
		let path = props.apiPath;
		//when static filter is provided
		// example /products/index/category/toys
		if (fieldName) {
			path = path + '/' + encodeURIComponent(fieldName) + '/' + encodeURIComponent(fieldValue);
		}
		if (sortBy) {
			pageParams.orderby = sortBy;
			if (sortType) {
				pageParams.ordertype = sortType.toLowerCase();
			}
		}
		const queryString = utils.serializeQuery({ ...pageParams, ...filterParams });
		let url;
		if (path.includes('?')) {
			url = `${path}&${queryString}`;
		}
		else {
			url = `${path}?${queryString}`;
		}
		if (!props.isSubPage) {
			savePageState();
		}
		return url;
	}
	// first restore state from url query params if available
	// then fallback on local storage if available
	// use props as last state value
	function restorePageState() {
		const storeState = localStore.getPageData(props.pageName) || {};
		let { page = pageNo, limit = pageLimit, orderby = orderBy, ordertype = orderType } = storeState.pagination || {};
		pageNo = parseInt((searchParams.get("page") || page));
		pageLimit = parseInt((searchParams.get("limit") || limit));
		orderBy = searchParams.get("orderby") || orderby;
		orderType = searchParams.get("ordertype") || ordertype;
	}
	//save current page state in localstorage
	function savePageState() {
		let currentState = { pagination: pageParams, filters: filterParams }
		localStore.setPageData(props.pageName, currentState);
	}
	function resetPagination() {
		if (pageReady && currentPage > 1) {
			setCurrentPage(1);
			setFirstRow(0);
		}
		setResetRecords(true); // set previous record to be cleared after fetch from api
	}
	//prime paginator component change event.
	function onPageChange(e) {
		setFirstRow(e.first);
		setLimit(e.rows);
		setCurrentPage(e.page + 1);
	}
	// set next page and trigger fetch from api
	function setPrevPage() {
		setCurrentPage(currentPage - 1);
	}
	// set next page and trigger fetch from api
	function setNextPage() {
		setCurrentPage(currentPage + 1);
	}
	//build breadcrum menu items based on current
	// breadcrum is build only on page static filters
	function getPageBreadCrumbs() {
		const items = [];
		const filterName = searchParams.get('tag') || fieldName;
		if (filterName) {
			items.push({
				label: filterName,
				icon: 'pi pi-home',
				command: () => app.navigate(`/${props.pageName}`)
			});
		}
		const filterValue = searchParams.get('label') || fieldValue;
		if (filterValue) {
			items.push({
				label: filterValue,
			});
		}
		return items;
	}
	//prime datatable component sort event
	function onSort(event) {
		if (event.sortField) {
			setSortBy(event.sortField);
			setSortOrder(event.sortOrder)
			if (sortType === 'asc') {
				setSortType('desc');
			}
			else {
				setSortType('asc');
			}
		}
	}
	function toggleSortType() {
		if (sortType === 'desc') {
			setSortType('asc');
		}
		else {
			setSortType('desc');
		}
	}
	//select record and set it as the master record
	function setCurrentRecord(record) {
		setSelectedItems([record]);
	}
	function expandRow(event) {
		const record = event.data;
		setExpandedRows(record);
	}
	// set the selected item as the current record.
	let currentRecord = null;
	if (selectedItems.length === 1) {
		currentRecord = selectedItems[0];
	}
	else {
		currentRecord = null;
	}
	//delete single item by id or selected records
	async function deleteItem(id) {
		if (id) {
			const newRecords = [...records];
			if (Array.isArray(id)) {
				id = id.map(value => value[props.primaryKey]);
			}
			else {
				id = [id];
			}
			let title = props.msgTitle;
			let prompt = props.msgBeforeDelete;
			confirmDialog({
				message: prompt,
				header: title,
				icon: 'pi pi-exclamation-triangle',
				accept: async () => {
					//callback to execute when user confirms the action
					try {
						id.forEach((itemId) => {
							let itemIndex = newRecords.findIndex(item => item[props.primaryKey] === itemId);
							if (itemIndex !== -1) {
								newRecords.splice(itemIndex, 1);
							}
						});
						setRecords(newRecords);
						const recid = encodeURIComponent(id.toString());
						const url = `${props.pageName}/delete/${recid}`;
						await api.get(url);
						queryClient.invalidateQueries(props.pageName);
						app.flashMsg(title, props.msgAfterDelete);
					}
					catch (err) {
						app.showPageRequestError(err);
					}
				},
				reject: () => {
					//callback to execute when user rejects the action
				}
			});
		}
	}
	const pagination = {
		totalRecords,
		canLoadMore,
		finishedLoading,
		totalPages,
		recordsPosition,
		recordCount,
		firstRow,
		currentPage,
		limit,
		onPageChange,
		setPrevPage,
		setNextPage,
		layout: 'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
	}
	const page = {
		records,
		pageReady,
		loading: isLoading,
		singleSelect,
		selectedItems,
		apiRequestError: error,
		apiUrl,
		currentRecord,
		sortBy,
		sortType,
		sortOrder,
		expandedRows,
		expandRow,
		setSelectedItems,
		setSingleSelect,
		getPageBreadCrumbs,
		onSort,
		setSortBy,
		setSortType,
		toggleSortType,
		deleteItem,
		setCurrentRecord,
		pagination,
		filterController
	}
	return useMemo(() => page,
		[records, selectedItems, isLoading, pagination, error, fieldName, fieldValue, filterController]
	);
}
export default useListPage;