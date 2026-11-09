
import { Button } from 'primereact/button';
import { ExportPageData } from 'components/ExportPageData';
import { Menubar } from 'primereact/menubar';
import { PageRequestError } from 'components/PageRequestError';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import FacturasViewPage from 'pages/facturas/View';
import PagosEditPage from 'pages/pagos/Edit';
import useApp from 'hooks/useApp';
import useUtils from 'hooks/useUtils';

import useViewPage from 'hooks/useViewPage';
const defaultProps = {
	id: null,
	primaryKey: 'pago_id',
	pageName: 'pagos',
	apiPath: 'pagos/view',
	routeName: 'pagosview',
	msgBeforeDelete: "Are you sure you want to delete this record?",
	msgTitle: "Delete record",
	msgAfterDelete: "Record deleted successfully",
	showHeader: true,
	showFooter: true,
	exportData: true,
	isSubPage: false,
}

const PagosViewPage = (componentProps ) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	const utils = useUtils();
	const pageController = useViewPage(props);
	const { item, pageReady, loading, apiUrl, apiRequestError, deleteItem } = pageController;
	function ActionButton(data){
		const items = [
		{
			label: "Edit",
			command: (event) => { app.openPageDialog(<PagosEditPage isSubPage apiPath={`/pagos/edit/${data.pago_id}`} />, {closeBtn: true }) },
			icon: "pi pi-pencil"
		},
		{
			label: "Delete",
			command: (event) => { deleteItem(data.pago_id) },
			icon: "pi pi-trash"
		}
	]
		return (<Menubar className="p-0 " model={items} />);
	}
	function ExportData() {
		if (props.exportData) {
			const downloadFileName = `${utils.dateNow()}-pagos`;
			return (
				<ExportPageData print pageUrl={apiUrl} downloadFileName={downloadFileName} butonLabel="Export" tooltip="Export" buttonIcon="pi pi-print" />
			);
		}
	}

	function PageFooter() {
		if (props.showFooter) {
			return (
				<div className="flex gap-3">
					<ExportData />
	<div className="flex ">
	{ActionButton(item)}

	</div>
				</div>
			);
		}
	}
	if(loading){
		return (
			<div className="p-3 text-center">
				<ProgressSpinner style={{width:'50px', height:'50px'}} />
			</div>
		);
	}

	if(apiRequestError){
		return (
			<PageRequestError error={apiRequestError} />
		);
	}

	if(pageReady){
		return (
			<div>
<main id="PagosViewPage" className="main-page">
    { (props.showHeader) && 
    <section className="page-section mb-4" >
        <div className="container-fluid">
            <div className="flex flex-wrap gap-4 items-center gap-4">
                { !props.isSubPage && 
                <div className="md:col-span-4 " >
                    <Button onClick={() => app.navigate(-1)} label=""  className="p-button p-button-text " icon="pi pi-arrow-left"  />
                </div>
                }
                <div className="col-span-full " >
                    <Title title="Pago Details"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-eye" avatarSize="large"    separator={false} />
                </div>
            </div>
        </div>
        <hr />
    </section>
    }
    <section className="page-section mb-4" >
        <div className="container-fluid">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-full comp-grid" >
                    <div >
                        {/*PageComponentStart*/}
                        <div className="mb-3 grid grid-cols-12 gap-4">
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Pago Id</div>
                                        <div className="font-bold">{ item.pago_id }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Factura Id</div>
                                        <div className="font-bold">{item.factura_id && <Button className="p-button-text" icon="pi pi-eye" label="Facturas Detail" onClick={() => app.openPageDialog(<FacturasViewPage isSubPage apiPath={`/facturas/view/${item.factura_id}`} />, {closeBtn: true })} /> }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Monto</div>
                                        <div className="font-bold">{ item.monto }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Fecha Pago</div>
                                        <div className="font-bold">{ item.fecha_pago }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Forma Pago</div>
                                        <div className="font-bold">{ item.forma_pago }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Referencia</div>
                                        <div className="font-bold">{ item.referencia }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Notas</div>
                                        <div className="font-bold">{ item.notas }</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-4">
                                <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                    <div>
                                        <div className="text-gray-600 mb-1">Created At</div>
                                        <div className="font-bold">{ item.created_at }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*PageComponentEnd*/}
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

				<PageFooter />
			</div>
		);
	}
}
export default PagosViewPage;
