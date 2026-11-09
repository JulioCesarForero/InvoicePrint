import { ProgressSpinner } from 'primereact/progressspinner';

export default function PageLoading(props) {
	return (
		<div className="flex align-items-center justify-content-center h-full">
			<ProgressSpinner style={{ width: '50px' }} />
		</div>
	);
}