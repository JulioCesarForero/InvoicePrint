
import { useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Title } from 'components/Title';
import FacturasListPage from 'pages/facturas/List';
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
		const facturasFormData = { cliente_id:record?.cliente_id }
		app.setPageFormData('facturas', facturasFormData);

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
        <TabPanel header={<Title title="Cliente Facturas"  headerClass="p-0" titleClass="text-lg font-bold"  iconClass="pi pi-th-large" avatarSize="small"    separator={false} />}>
            <div className="reset-grid">
                <FacturasListPage isSubPage  fieldName="facturas.cliente_id" fieldValue={masterRecord.cliente_id} showBreadcrumbs={false} showHeader={false} showFooter={true}>
                </FacturasListPage>
            </div>
        </TabPanel>
    </TabView>
</div>

		);
	}
}
export default MasterDetailPages;
