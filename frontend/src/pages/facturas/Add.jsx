
import { Formik, Form, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { DataSource } from 'components/DataSource';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import useApp from 'hooks/useApp';

import useAddPage from 'hooks/useAddPage';
const defaultProps = {
	primaryKey: 'factura_id',
	pageName: 'facturas',
	apiPath: 'facturas/add',
	routeName: 'facturasadd',
	submitButtonLabel: "Submit",
	formValidationError: "Form is invalid",
	formValidationMsg: "Please complete the form",
	msgTitle: "Create Record",
	msgAfterSave: "Record added successfully",
	msgBeforeSave: "",
	showHeader: true,
	showFooter: true,
	redirect: true,
	isSubPage: false
}

const FacturasAddPage = (componentProps) => {
	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	
	//form validation rules
	const validationSchema = yup.object().shape({
		serie_folio_id: yup.string().required().label("Serie Folio Id"),
		cliente_id: yup.string().required().label("Cliente Id"),
		empresa_id: yup.string().required().label("Empresa Id"),
		fecha_emision: yup.string().required().label("Fecha Emision"),
		fecha_vencimiento: yup.string().nullable().label("Fecha Vencimiento"),
		subtotal: yup.number().required().label("Subtotal"),
		impuesto_total: yup.number().required().label("Impuesto Total"),
		total: yup.number().required().label("Total"),
		moneda: yup.string().required().label("Moneda"),
		forma_pago: yup.string().nullable().label("Forma Pago"),
		metodo_pago: yup.string().nullable().label("Metodo Pago"),
		uso_cfdi: yup.string().nullable().label("Uso Cfdi"),
		estatus: yup.string().required().label("Estatus"),
		notas: yup.string().nullable().label("Notas"),
		uuid: yup.string().nullable().label("Uuid")
	});

	
	//form default values
	const formDefaultValues = {
		serie_folio_id: '', 
		cliente_id: '', 
		empresa_id: '', 
		fecha_emision: new Date(), 
		fecha_vencimiento: new Date(), 
		subtotal: '', 
		impuesto_total: '', 
		total: '', 
		moneda: '', 
		forma_pago: '', 
		metodo_pago: '', 
		uso_cfdi: '', 
		estatus: '', 
		notas: '', 
		uuid: '', 
	}

	
	//page hook where logics resides
	const pageController =  useAddPage({ props, formDefaultValues, afterSubmit });

	
	// destructure and grab what the page needs
	const { formData, resetForm, handleSubmit, submitForm, pageReady, loading, saving, inputClassName } = pageController;
	
	//event raised after form submit
	function afterSubmit(response){
		app.flashMsg(props.msgTitle, props.msgAfterSave);
		resetForm();
		if(app.isDialogOpen()){
			app.closeDialogs(); // if page is open as dialog, close dialog
		}
		else if(props.redirect) {
			app.navigate(`/facturas`);
		}

	}
	
	// page loading form data from api
	if(loading){
		return (
			<div className="p-3 text-center">
				<ProgressSpinner style={{width:'50px', height:'50px'}} />
			</div>
		);
	}

	
	//page has loaded any required data and ready to render
	if(pageReady){
		return (
<main id="FacturasAddPage" className="main-page">
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
                    <Title title="Add Factura"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-plus" avatarSize="large"    separator={false} />
                </div>
            </div>
        </div>
        <hr />
    </section>
    }
    <section className="page-section " >
        <div className="container-fluid">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-full md:col-span-7 comp-grid" >
                    <div >
                        <Formik initialValues={formData} validationSchema={validationSchema} onSubmit={(values, actions) =>submitForm(values)}>
                            {(formik) => 
                            <>
                            <Form className={`${!props.isSubPage ? 'card nice-shadow-2 ' : ''}`}>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Serie Folio Id *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/serie_folio_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="serie_folio_id"     optionLabel="label" optionValue="value" value={formik.values.serie_folio_id} onChange={formik.handleChange} options={response} label="Serie Folio Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.serie_folio_id)}   />
                                                    <ErrorMessage name="serie_folio_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Cliente Id *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/cliente_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="cliente_id"     optionLabel="label" optionValue="value" value={formik.values.cliente_id} onChange={formik.handleChange} options={response} label="Cliente Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.cliente_id)}   />
                                                    <ErrorMessage name="cliente_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Empresa Id *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/empresa_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="empresa_id"     optionLabel="label" optionValue="value" value={formik.values.empresa_id} onChange={formik.handleChange} options={response} label="Empresa Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.empresa_id)}   />
                                                    <ErrorMessage name="empresa_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Fecha Emision *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <Calendar name="fecha_emision" showButtonBar className={inputClassName(formik?.errors?.fecha_emision)} dateFormat="yy-mm-dd" value={formik.values.fecha_emision} onChange={formik.handleChange} showIcon        />
                                                <ErrorMessage name="fecha_emision" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Fecha Vencimiento 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <Calendar name="fecha_vencimiento" showButtonBar className={inputClassName(formik?.errors?.fecha_vencimiento)} dateFormat="yy-mm-dd" value={formik.values.fecha_vencimiento} onChange={formik.handleChange} showIcon        />
                                                <ErrorMessage name="fecha_vencimiento" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Subtotal *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="subtotal"  onChange={formik.handleChange}  value={formik.values.subtotal}   label="Subtotal" type="number" placeholder="Enter Subtotal"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.subtotal)} />
                                                <ErrorMessage name="subtotal" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Impuesto Total *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="impuesto_total"  onChange={formik.handleChange}  value={formik.values.impuesto_total}   label="Impuesto Total" type="number" placeholder="Enter Impuesto Total"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.impuesto_total)} />
                                                <ErrorMessage name="impuesto_total" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Total *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="total"  onChange={formik.handleChange}  value={formik.values.total}   label="Total" type="number" placeholder="Enter Total"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.total)} />
                                                <ErrorMessage name="total" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Moneda *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="moneda"  onChange={formik.handleChange}  value={formik.values.moneda}   label="Moneda" type="text" placeholder="Enter Moneda"        className={inputClassName(formik?.errors?.moneda)} />
                                                <ErrorMessage name="moneda" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Forma Pago 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="forma_pago"  onChange={formik.handleChange}  value={formik.values.forma_pago}   label="Forma Pago" type="text" placeholder="Enter Forma Pago"        className={inputClassName(formik?.errors?.forma_pago)} />
                                                <ErrorMessage name="forma_pago" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Metodo Pago 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="metodo_pago"  onChange={formik.handleChange}  value={formik.values.metodo_pago}   label="Metodo Pago" type="text" placeholder="Enter Metodo Pago"        className={inputClassName(formik?.errors?.metodo_pago)} />
                                                <ErrorMessage name="metodo_pago" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Uso Cfdi 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="uso_cfdi"  onChange={formik.handleChange}  value={formik.values.uso_cfdi}   label="Uso Cfdi" type="text" placeholder="Enter Uso Cfdi"        className={inputClassName(formik?.errors?.uso_cfdi)} />
                                                <ErrorMessage name="uso_cfdi" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Estatus *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="estatus"  onChange={formik.handleChange}  value={formik.values.estatus}   label="Estatus" type="text" placeholder="Enter Estatus"        className={inputClassName(formik?.errors?.estatus)} />
                                                <ErrorMessage name="estatus" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Notas 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="notas"  onChange={formik.handleChange}  value={formik.values.notas}   label="Notas" type="text" placeholder="Enter Notas"        className={inputClassName(formik?.errors?.notas)} />
                                                <ErrorMessage name="notas" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Uuid 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="uuid"  onChange={formik.handleChange}  value={formik.values.uuid}   label="Uuid" type="text" placeholder="Enter Uuid"        className={inputClassName(formik?.errors?.uuid)} />
                                                <ErrorMessage name="uuid" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                { props.showFooter && 
                                <div className="text-center my-3">
                                    <Button onClick={(e) => handleSubmit(e, formik)} className="p-button-primary" type="submit" label="Submit" icon="pi pi-send" loading={saving} />
                                </div>
                                }
                            </Form>
                            </>
                            }
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
		);
	}
}

export default FacturasAddPage;
