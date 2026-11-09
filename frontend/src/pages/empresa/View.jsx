
import { Button } from 'primereact/button';
import { ExportPageData } from 'components/ExportPageData';
import { Menubar } from 'primereact/menubar';
import { PageRequestError } from 'components/PageRequestError';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import EmpresaEditPage from 'pages/empresa/Edit';
import useApp from 'hooks/useApp';
import useUtils from 'hooks/useUtils';

import useViewPage from 'hooks/useViewPage';
import MasterDetailPages from './MasterDetailPages';
const defaultProps = {
	id: null,
	primaryKey: 'empresa_id',
	pageName: 'empresa',
	apiPath: 'empresa/view',
	routeName: 'empresaview',
	msgBeforeDelete: "Are you sure you want to delete this record?",
	msgTitle: "Delete record",
	msgAfterDelete: "Record deleted successfully",
	showHeader: true,
	showFooter: true,
	exportData: true,
	isSubPage: false,
}

const EmpresaViewPage = (componentProps ) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	const utils = useUtils();
	const pageController = useViewPage(props);
	const { item, currentRecord, pageReady, loading, apiUrl, apiRequestError, deleteItem } = pageController;
	function ActionButton(data){
		const items = [
		{
			label: "Edit",
			command: (event) => { app.openPageDialog(<EmpresaEditPage isSubPage apiPath={`/empresa/edit/${data.empresa_id}`} />, {closeBtn: true }) },
			icon: "pi pi-pencil"
		},
		{
			label: "Delete",
			command: (event) => { deleteItem(data.empresa_id) },
			icon: "pi pi-trash"
		}
	]
		return (<Menubar className="p-0 " model={items} />);
	}
	function ExportData() {
		if (props.exportData) {
			const downloadFileName = `${utils.dateNow()}-empresa`;
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
<main id="EmpresaViewPage" className="main-page">
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
                    <Title title="Empresa Details"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-eye" avatarSize="large"    separator={false} />
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
                        <div className="">
                            <div className="col-span-full">
                                {/*PageComponentStart*/}
                                <div className="mb-3 grid grid-cols-12 gap-4">
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Empresa Id</div>
                                                <div className="font-bold">{ item.empresa_id }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Nombre</div>
                                                <div className="font-bold">{ item.nombre }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Rfc</div>
                                                <div className="font-bold">{ item.rfc }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Direccion</div>
                                                <div className="font-bold">{ item.direccion }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Ciudad</div>
                                                <div className="font-bold">{ item.ciudad }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Estado</div>
                                                <div className="font-bold">{ item.estado }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Pais</div>
                                                <div className="font-bold">{ item.pais }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Codigo Postal</div>
                                                <div className="font-bold">{ item.codigo_postal }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Telefono</div>
                                                <div className="font-bold">{ item.telefono }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Email</div>
                                                <div className="font-bold">{ item.email }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Logo</div>
                                                <div className="font-bold">{ item.logo }</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full md:col-span-4">
                                        <div className="flex gap-2 items-center card p-3 nice-shadow-2">
                                            <div>
                                                <div className="text-gray-600 mb-1">Regimen Fiscal</div>
                                                <div className="font-bold">{ item.regimen_fiscal }</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/*PageComponentEnd*/}
                            </div>
                            {
                            (currentRecord && !props.isSubPage) && 
                            <div className="col-span-12">
                                <div className="card my-3 p-1">
                                    <MasterDetailPages masterRecord={currentRecord} scrollIntoView={false} />
                                </div>
                            </div>
                            }
                        </div>
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
export default EmpresaViewPage;
