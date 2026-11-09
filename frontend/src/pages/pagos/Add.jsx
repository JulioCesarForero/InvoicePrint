
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
	primaryKey: 'pago_id',
	pageName: 'pagos',
	apiPath: 'pagos/add',
	routeName: 'pagosadd',
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

const PagosAddPage = (componentProps) => {
	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	
	//form validation rules
	const validationSchema = yup.object().shape({
		factura_id: yup.string().required().label("Factura Id"),
		monto: yup.number().required().label("Monto"),
		fecha_pago: yup.string().required().label("Fecha Pago"),
		forma_pago: yup.string().nullable().label("Forma Pago"),
		referencia: yup.string().nullable().label("Referencia"),
		notas: yup.string().nullable().label("Notas")
	});

	
	//form default values
	const formDefaultValues = {
		factura_id: '', 
		monto: '', 
		fecha_pago: new Date(), 
		forma_pago: '', 
		referencia: '', 
		notas: '', 
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
			app.navigate(`/pagos`);
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
<main id="PagosAddPage" className="main-page">
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
                    <Title title="Add Pago"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-plus" avatarSize="large"    separator={false} />
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
                                                Factura Id *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/factura_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="factura_id"     optionLabel="label" optionValue="value" value={formik.values.factura_id} onChange={formik.handleChange} options={response} label="Factura Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.factura_id)}   />
                                                    <ErrorMessage name="factura_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Monto *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="monto"  onChange={formik.handleChange}  value={formik.values.monto}   label="Monto" type="number" placeholder="Enter Monto"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.monto)} />
                                                <ErrorMessage name="monto" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Fecha Pago *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <Calendar name="fecha_pago" showButtonBar className={inputClassName(formik?.errors?.fecha_pago)} dateFormat="yy-mm-dd" value={formik.values.fecha_pago} onChange={formik.handleChange} showIcon        />
                                                <ErrorMessage name="fecha_pago" component="span" className="p-error" />
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
                                                Referencia 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="referencia"  onChange={formik.handleChange}  value={formik.values.referencia}   label="Referencia" type="text" placeholder="Enter Referencia"        className={inputClassName(formik?.errors?.referencia)} />
                                                <ErrorMessage name="referencia" component="span" className="p-error" />
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

export default PagosAddPage;
