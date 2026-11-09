
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
	primaryKey: 'producto_id',
	pageName: 'productos',
	apiPath: 'productos/edit',
	routeName: 'productosedit',
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

const ProductosEditPage = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	// form validation schema
	const validationSchema = yup.object().shape({
		codigo: yup.string().required().label("Codigo"),
		nombre: yup.string().required().label("Nombre"),
		descripcion: yup.string().nullable().label("Descripcion"),
		precio_unitario: yup.number().required().label("Precio Unitario"),
		impuesto_id: yup.string().nullable().label("Impuesto Id"),
		activo: yup.string().required().label("Activo")
	});

	// form default values
	const formDefaultValues = {
		codigo: '', 
		nombre: '', 
		descripcion: '', 
		precio_unitario: '', 
		impuesto_id: '', 
		activo: '', 
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
			app.navigate(`/productos`);
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
<main id="ProductosEditPage" className="main-page">
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
                    <Title title="Edit Producto"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-pencil" avatarSize="large"    separator={false} />
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
                                                Codigo *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="codigo"  onChange={formik.handleChange}  value={formik.values.codigo}   label="Codigo" type="text" placeholder="Enter Codigo"        className={inputClassName(formik?.errors?.codigo)} />
                                                <ErrorMessage name="codigo" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Nombre *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="nombre"  onChange={formik.handleChange}  value={formik.values.nombre}   label="Nombre" type="text" placeholder="Enter Nombre"        className={inputClassName(formik?.errors?.nombre)} />
                                                <ErrorMessage name="nombre" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Descripcion 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="descripcion"  onChange={formik.handleChange}  value={formik.values.descripcion}   label="Descripcion" type="text" placeholder="Enter Descripcion"        className={inputClassName(formik?.errors?.descripcion)} />
                                                <ErrorMessage name="descripcion" component="span" className="p-error" />
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
                                                Activo *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="activo"  onChange={formik.handleChange}  value={formik.values.activo}   label="Activo" type="text" placeholder="Enter Activo"        className={inputClassName(formik?.errors?.activo)} />
                                                <ErrorMessage name="activo" component="span" className="p-error" />
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
export default ProductosEditPage;
