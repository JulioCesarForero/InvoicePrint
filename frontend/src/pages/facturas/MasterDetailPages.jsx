
import { useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Title } from 'components/Title';
import DetallesfacturaListPage from 'pages/detallesfactura/List';
import useApp from 'hooks/useApp';

const MasterDetailPages = (props) => {
		const app = useApp();
	const { masterRecord, scrollIntoView = true } = props;

	const activeTab = 0;
	function scrollToDetailPage() {
		if (scrollIntoView) {
			const pageElement = document.getElementById('master-detailpage');
			if(pageElement){
				pageElement.scrollIntoView({behavior:'smooth', block:'start'});
			}
		}
	}

	// pass form data from master to detail
	function setDetailPageFormData(){
		const record = masterRecord;
		// set  form data
		const detallesfacturaFormData = { factura_id:record?.factura_id }
		app.setPageFormData('detallesfactura', detallesfacturaFormData);

	}

	// pass form data from master to detail
	useEffect(() => {
		scrollToDetailPage();
		setDetailPageFormData();
	}, [masterRecord]);
	if(masterRecord){
		return (
<div id="master-detailpage">
    <TabView value={activeTab}>
        <TabPanel header={<Title title="Factura Detalles Factura"  headerClass="p-0" titleClass="text-lg font-bold"  iconClass="pi pi-th-large" avatarSize="small"    separator={false} />}>
            <div className="reset-grid">
                <DetallesfacturaListPage isSubPage  fieldName="detalles_factura.factura_id" fieldValue={masterRecord.factura_id} showBreadcrumbs={false} showHeader={false} showFooter={true}>
                </DetallesfacturaListPage>
            </div>
        </TabPanel>
    </TabView>
</div>

		);
	}
}
export default MasterDetailPages;
