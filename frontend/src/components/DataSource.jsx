import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProgressSpinner } from 'primereact/progressspinner';

import useApi from 'hooks/useApi';
const defaultProps =  {
	firstRecord: false,
	apiPath: '',
	itemTemplate: null,
	loadingTemplate: null,
	showLoading: true,
	onLoad: (data) => { },
	onError: (error) => { },
}

const DataSource = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}

	const api = useApi();
	const { apiPath, showLoading, itemTemplate, loadingTemplate } = props;
	const { isLoading, isFetching, isError, data, error, refetch } = useQuery({
		queryKey: [apiPath],
		queryFn: fetchRecords,
		retry: false,
		refetchOnMount: false,
	});

	function fetchRecords() {
		if (apiPath) {
			return api.get(apiPath).then((res) => res?.data);
		}
		return Promise.resolve([]);
	}

	useEffect(() => {
		if (data) {
			props.onLoad(data);
		}
		if (isError) {
			props.onError(error);
		}
	}, [data, isError]);

	let response = data || [];
	if (props.firstRecord && response.length) {
		response = response[0];
	}
	const loading = isLoading || isFetching
	if (loading && showLoading) {
		if (loadingTemplate) {
			return props.loadingTemplate
		}
		return (
			<div className="text-center">
				<ProgressSpinner style={{ width: '40px', height: '40px' }} />
			</div>
		)
	}

	if (isError) {
		console.error(error);
	}
	if (itemTemplate) {
		return <>{response?.map((item, index) => itemTemplate(item, index))}</>
	}
	return props.children({ loading, response, error, reload: refetch });
}

export { DataSource }