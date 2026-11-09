
import { Formik, Form, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { DataSource } from 'components/DataSource';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { PageRequestError } from 'components/PageRequestError';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import useApp from 'hooks/useApp';

import useEditPage from 'hooks/useEditPage';
const defaultProps = {
	primaryKey: 'detalle_id',
	pageName: 'detallesfactura',
	apiPath: 'detallesfactura/edit',
	routeName: 'detallesfacturaedit',
	submitButtonLabel: "Update",
	formValidationError: "Form is invalid",
	formValidationMsg: "Please complete the form",
	msgTitle: "Update Record",
	msgAfterSave: "Record updated successfully",
	msgBeforeSave: "",
	showHeader: true,
	showFooter: true,
	redirect: true,
	isSubPage: false
}

const DetallesfacturaEditPage = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	// form validation schema
	const validationSchema = yup.object().shape({
		factura_id: yup.string().required().label("Factura Id"),
		producto_id: yup.string().required().label("Producto Id"),
		cantidad: yup.number().required().label("Cantidad"),
		precio_unitario: yup.number().required().label("Precio Unitario"),
		descuento: yup.number().nullable().label("Descuento"),
		impuesto_id: yup.string().nullable().label("Impuesto Id"),
		impuesto_monto: yup.number().nullable().label("Impuesto Monto"),
		total: yup.number().required().label("Total")
	});

	// form default values
	const formDefaultValues = {
		factura_id: '', 
		producto_id: '', 
		cantidad: '', 
		precio_unitario: '', 
		descuento: '', 
		impuesto_id: '', 
		impuesto_monto: '', 
		total: '', 
	}

	//where page logics resides
	const pageController = useEditPage({ props, formDefaultValues, afterSubmit });
	//destructure and grab what we need
	const { formData, handleSubmit, submitForm, pageReady, loading, saving, apiRequestError, inputClassName } = pageController
	//Event raised on form submit success
	function afterSubmit(response){
		app.flashMsg(props.msgTitle, props.msgAfterSave);
		if(app.isDialogOpen()){
			app.closeDialogs(); // if page is open as dialog, close dialog
		}
		else if(props.redirect) {
			app.navigate(`/detallesfactura`);
		}

	}
	// loading form data from api
	if(loading){
		return (
			<div className="p-3 text-center">
				<ProgressSpinner style={{width:'50px', height:'50px'}} />
			</div>
		);
	}
	//display error page 
	if(apiRequestError){
		return (
			<PageRequestError error={apiRequestError} />
		);
	}

	//page is ready when formdata loaded successfully
	if(pageReady){
		return (
<main id="DetallesfacturaEditPage" className="main-page">
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
                    <Title title="Edit Detalles Factura"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-pencil" avatarSize="large"    separator={false} />
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
                        <Formik
                            initialValues={formData}
                            validationSchema={validationSchema} 
                            onSubmit={(values, actions) => {
                            submitForm(values);
                            }
                            }
                            >
                            { (formik) => {
                            return (
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
                                                Producto Id *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/producto_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="producto_id"     optionLabel="label" optionValue="value" value={formik.values.producto_id} onChange={formik.handleChange} options={response} label="Producto Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.producto_id)}   />
                                                    <ErrorMessage name="producto_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Cantidad *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="cantidad"  onChange={formik.handleChange}  value={formik.values.cantidad}   label="Cantidad" type="number" placeholder="Enter Cantidad"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.cantidad)} />
                                                <ErrorMessage name="cantidad" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Precio Unitario *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="precio_unitario"  onChange={formik.handleChange}  value={formik.values.precio_unitario}   label="Precio Unitario" type="number" placeholder="Enter Precio Unitario"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.precio_unitario)} />
                                                <ErrorMessage name="precio_unitario" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Descuento 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="descuento"  onChange={formik.handleChange}  value={formik.values.descuento}   label="Descuento" type="number" placeholder="Enter Descuento"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.descuento)} />
                                                <ErrorMessage name="descuento" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Impuesto Id 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <DataSource   apiPath="components_data/impuesto_id_option_list"  >
                                                    {
                                                    ({ response }) => 
                                                    <>
                                                    <Dropdown  name="impuesto_id"     optionLabel="label" optionValue="value" value={formik.values.impuesto_id} onChange={formik.handleChange} options={response} label="Impuesto Id"  placeholder="Select a value ..."  className={inputClassName(formik?.errors?.impuesto_id)}   />
                                                    <ErrorMessage name="impuesto_id" component="span" className="p-error" />
                                                    </>
                                                    }
                                                </DataSource>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Impuesto Monto 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="impuesto_monto"  onChange={formik.handleChange}  value={formik.values.impuesto_monto}   label="Impuesto Monto" type="number" placeholder="Enter Impuesto Monto"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.impuesto_monto)} />
                                                <ErrorMessage name="impuesto_monto" component="span" className="p-error" />
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
                                </div>
                                { props.showFooter && 
                                <div className="text-center my-3">
                                    <Button onClick={(e) => handleSubmit(e, formik)}  type="submit" label="Update" icon="pi pi-send" loading={saving} />
                                </div>
                                }
                            </Form>
                            );
                            }
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
export default DetallesfacturaEditPage;
