
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ExportPageData } from 'components/ExportPageData';
import { FilterTags } from 'components/FilterTags';
import { IconField } from 'primereact/iconfield';
import { ImportPageData } from 'components/ImportPageData';
import { useImprimirFactura } from 'components/ImprimirFactura';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Link } from 'react-router';
import { Menubar } from 'primereact/menubar';
import { PageRequestError } from 'components/PageRequestError';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import ClientesViewPage from 'pages/clientes/View';
import EmpresaViewPage from 'pages/empresa/View';
import FacturasAddPage from 'pages/facturas/Add';
import SeriesfoliosViewPage from 'pages/seriesfolios/View';
import useApp from 'hooks/useApp';
import useUtils from 'hooks/useUtils';

import useListPage from 'hooks/useListPage';
const defaultProps = {
	primaryKey: 'factura_id',
	pageName: 'facturas',
	apiPath: 'facturas/index',
	routeName: 'facturaslist',
	msgBeforeDelete: "Are you sure you want to delete this record?",
	msgTitle: "Delete record",
	msgAfterDelete: "Record deleted successfully",
	showHeader: true,
	showFooter: true,
	paginate: true,
	isSubPage: false,
	showBreadcrumbs: true,
	exportData: true,
	importData: true,
	keepRecords: false,
	multiCheckbox: true,
	search: '',
	fieldName: null,
	fieldValue: null,
	sortField: '',
	sortDir: '',
	pageNo: 1,
	limit: 10,
}

const FacturasListPage = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}

		const app = useApp();
	const imprimirFactura = useImprimirFactura();
	const utils = useUtils();
	const filterSchema = {
		search: {
			tagTitle: "Search",
			value: '',
			valueType: 'single',
			options: [],
		}
	}
	const pageController = useListPage(props, filterSchema);
	const filterController = pageController.filterController;
	const { records, pageReady, loading, selectedItems, apiUrl, sortBy, sortOrder, apiRequestError, setSelectedItems, getPageBreadCrumbs, onSort, deleteItem, pagination } = pageController;

	const { filters, setFilterValue } = filterController;
	const { totalRecords, totalPages, recordsPosition, firstRow, limit, onPageChange } =  pagination;
	function ActionButton(data){
		const items = [
		{
			label: "Imprimir factura",
			command: (event) => { imprimirFactura.descargarPdf(data.factura_id) },
			icon: "pi pi-file-pdf"
		},
		{
			label: "View",
			command: (event) => { app.navigate(`/facturas/view/${data.factura_id}`) },
			icon: "pi pi-eye"
		},
		{
			label: "Edit",
			command: (event) => { app.navigate(`/facturas/edit/${data.factura_id}`) },
			icon: "pi pi-pencil"
		},
		{
			label: "Delete",
			command: (event) => { deleteItem(data.factura_id) },
			icon: "pi pi-trash"
		}
	]
		return (<Menubar className="p-0 " model={items} />);
	}
	function FacturaIdTemplate(data){
		if(data){
			return (
				<Link to={`/facturas/view/${data.factura_id}`}> { data.factura_id }</Link>

			);
		}
	}

	function SerieFolioIdTemplate(data){
		if(data){
			return (
				<>{data.serie_folio_id && <Button className="p-button-text" icon="pi pi-eye" label="Series Folios" onClick={() => app.openPageDialog(<SeriesfoliosViewPage isSubPage apiPath={`/seriesfolios/view/${data.serie_folio_id}`} />, {closeBtn: true })} /> }</>
			);
		}
	}

	function ClienteIdTemplate(data){
		if(data){
			return (
				<>{data.cliente_id && <Button className="p-button-text" icon="pi pi-eye" label="Clientes" onClick={() => app.openPageDialog(<ClientesViewPage isSubPage apiPath={`/clientes/view/${data.cliente_id}`} />, {closeBtn: true })} /> }</>
			);
		}
	}

	function EmpresaIdTemplate(data){
		if(data){
			return (
				<>{data.empresa_id && <Button className="p-button-text" icon="pi pi-eye" label="Empresa" onClick={() => app.openPageDialog(<EmpresaViewPage isSubPage apiPath={`/empresa/view/${data.empresa_id}`} />, {closeBtn: true })} /> }</>
			);
		}
	}
	function PageLoading(){
		if(loading){
			return (
				<>
					<div className="flex items-center justify-content-center text-gray-500 p-3">
						<div><ProgressSpinner style={{width:'30px', height:'30px'}} /> </div>
						<div  className="font-bold text-lg">Loading...</div>
					</div>

				</>
			);
		}
	}

	function EmptyRecordMessage(){
		if(pageReady && !records.length){
			return (
				<div className="text-lg mt-3 p-3 text-center text-gray-500 font-bold">
					No record found
				</div>
			);
		}
	}
	function MultiDelete() {
		if (selectedItems.length) {
			return (
				<Button onClick={()=> deleteItem(selectedItems)} icon="pi pi-trash" className="p-button-danger">
					Delete Selected ({ selectedItems.length })
				</Button>
			)
		}
	}
	function ExportData() {
		if (props.exportData && records.length) {
			const downloadFileName = `${utils.dateNow()}-facturas`;
			return (
				<ExportPageData print pageUrl={apiUrl} downloadFileName={downloadFileName} butonLabel="Export" tooltip="Export" buttonIcon="pi pi-print" />
			);
		}
	}
	function ImportData() {
		if (props.importData) {
			return (
				<ImportPageData label="Select a file to import" uploadPath="facturas/importdata" buttonIcon="pi pi-folder" buttonLabel="Import Data" onImportCompleted={(response) => {app.flashMsg('Import Data', response, 'success')}} />
			);
		}
	}
	function PagerControl() {
		if (props.paginate && totalPages > 1) {
		const pagerReportTemplate = {
			layout: pagination.layout,
			CurrentPageReport: (options) => {
				return (
					<>
						<span className="text-sm text-gray-500 px-2">Records <b>{ recordsPosition } of { options.totalRecords }</b></span>

					</>
				);
			}
		}
		return (
			<div className="flex-grow-1">
				<Paginator first={firstRow} rows={limit} totalRecords={totalRecords}  onPageChange={onPageChange} template={pagerReportTemplate} />
			</div>
		)

		}
	}
	function PageActionButtons() {
		return (
			<div className="flex flex-wrap gap-3 items-center">
				<MultiDelete />
				<ExportData />
				<ImportData />
			</div>
		);
	}

	function PageFooter() {
		if (pageReady && props.showFooter) {
			return (
				<div className="flex flex-wrap gap-4 justify-between items-center">
					<PageActionButtons />
					<PagerControl />
				</div>
			);
		}
	}

	function PageBreadcrumbs(){
		if(props.showBreadcrumbs) {
			const items = getPageBreadCrumbs();
			return (items.length > 0 && <BreadCrumb className="mb-3" model={items} />);
		}
	}

	if(apiRequestError){
		return (
			<PageRequestError error={apiRequestError} />
		);
	}

	return (
<main id="FacturasListPage" className="main-page">
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
                    <Title title="Facturas"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500"      separator={false} />
                </div>
            </div>
        </div>
        <hr />
    </section>
    }
    <section className="page-section mb-3" >
        <div className="container-fluid">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="col-span-full " >
                    <Button label="Add Factura" icon="pi pi-plus"  onClick={()=>app.openPageDialog(<FacturasAddPage isSubPage apiPath={`/facturas/add`} />, { closeBtn: true  })}  className="p-button w-full bg-primary "  />
                </div>
                <div className="col-span-full " >
                    <IconField>
                    <InputIcon className="pi pi-search"></InputIcon>
                    <InputText placeholder="Search" className="w-full" value={filters.search.value}  onChange={(e) => setFilterValue('search', e.target.value)} />
                    </IconField>
                </div>
            </div>
        </div>
    </section>
    <section className="page-section mb-4" >
        <div className="container-fluid">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-full comp-grid" >
                    <FilterTags filterController={filterController} />
                    <div >
                        <PageBreadcrumbs />
                        <div className="page-records">
                            <DataTable 
                                lazy={true} 
                                loading={loading} 
                                selectionMode="checkbox" selection={selectedItems} onSelectionChange={e => setSelectedItems(e.value)}
                                value={records} 
                                dataKey="factura_id" 
                                sortField={sortBy} 
                                sortOrder={sortOrder} 
                                onSort={onSort}
                                className=" p-datatable-sm" 
                                stripedRows={true}
                                showGridlines={false} 
                                rowHover={true}
                                emptyMessage={<EmptyRecordMessage />} 
                                >
                                {/*PageComponentStart*/}
                                <Column selectionMode="multiple" headerStyle={{width: '2rem'}}></Column>
                                <Column  field="factura_id" header="Factura Id" body={FacturaIdTemplate}  ></Column>
                                <Column  field="serie_folio_id" header="Serie Folio Id" body={SerieFolioIdTemplate}  ></Column>
                                <Column  field="folio" header="Folio"   ></Column>
                                <Column  field="cliente_id" header="Cliente Id" body={ClienteIdTemplate}  ></Column>
                                <Column  field="empresa_id" header="Empresa Id" body={EmpresaIdTemplate}  ></Column>
                                <Column  field="fecha_emision" header="Fecha Emision"   ></Column>
                                <Column  field="fecha_vencimiento" header="Fecha Vencimiento"   ></Column>
                                <Column  field="subtotal" header="Subtotal"   ></Column>
                                <Column  field="impuesto_total" header="Impuesto Total"   ></Column>
                                <Column  field="total" header="Total"   ></Column>
                                <Column  field="moneda" header="Moneda"   ></Column>
                                <Column  field="forma_pago" header="Forma Pago"   ></Column>
                                <Column  field="metodo_pago" header="Metodo Pago"   ></Column>
                                <Column  field="uso_cfdi" header="Uso Cfdi"   ></Column>
                                <Column  field="estatus" header="Estatus"   ></Column>
                                <Column  field="notas" header="Notas"   ></Column>
                                <Column  field="uuid" header="Uuid"   ></Column>
                                <Column  field="created_at" header="Created At"   ></Column>
                                <Column headerStyle={{width: 'auto'}} headerClass="text-center" body={ActionButton}></Column>
                                {/*PageComponentEnd*/}
                            </DataTable>
                        </div>
                        <PageFooter />
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

	);
}

export default FacturasListPage;
