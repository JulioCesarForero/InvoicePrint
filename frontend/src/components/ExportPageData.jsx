import React, { useRef } from "react";

import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

import useUtils from 'src/hooks/useUtils';
import useApp from 'src/hooks/useApp';
import useApi from 'src/hooks/useApi';

const defaultProps = {
	pdf: true,
	csv: true,
	excel: true,
	print: true,
	pageUrl: '',
	downloadFileName: 'records',
	buttonTitle: 'Export Data',
	buttonLabel: 'Export',
	buttonIcon: 'pi pi-print',
}

const ExportPageData = (componentProps) => {
	const props = { ...defaultProps, ...componentProps };
	const api = useApi();
	const app = useApp();
	const utils = useUtils();
	const exportMenu = useRef(null);
	const { pdf, csv, excel, pageName, print, downloadFileName, pageUrl, buttonLabel, buttonTitle, buttonIcon } = props;
	const pageExportFormats = [];

	if (csv) {
		pageExportFormats.push({
			label: 'Csv',
			icon: 'pi pi-table text-green-200',
			command: () => { exportPageRecords('csv') }
		})
	}

	if (pdf) {
		pageExportFormats.push({
			label: 'Pdf',
			icon: 'pi pi-file-pdf text-pink-500',
			command: () => { exportPageRecords('pdf') }
		})
	}

	if (excel) {
		pageExportFormats.push({
			label: 'Excel',
			icon: 'pi pi-file-excel text-green-500',
			command: () => { exportPageRecords('excel', 'xlsx') }
		});
	}

	function exportPageRecords(exportType, fileExt) {
		fileExt = fileExt || exportType;
		const queryParam = {
			export: exportType
		}

		const exportUrl = utils.setApiPath(pageUrl, queryParam);
		const fileName = `${downloadFileName}.${fileExt}`;

		app.showAppLoading("Exporting records...");
		api.download(exportUrl).then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', fileName);
				document.body.appendChild(link);
				link.click();
				link.remove();
				app.showAppLoading(false);
			},
			(response) => {
				console.error(response);
				app.showAppLoading(false);
				alert("Unable to download file")
			});
	}

	if (pdf || csv || excel) {
		return (
			<>
				<Button onClick={(event) => exportMenu.current.toggle(event)} label={buttonLabel} tooltip={buttonTitle} icon={buttonIcon} />
				<Menu ref={exportMenu} popup model={pageExportFormats} />
			</>
		);
	}

}

export { ExportPageData };