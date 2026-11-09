
import { Formik, Form, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { PageRequestError } from 'components/PageRequestError';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import useApp from 'hooks/useApp';

import useEditPage from 'hooks/useEditPage';
const defaultProps = {
	primaryKey: 'empresa_id',
	pageName: 'empresa',
	apiPath: 'empresa/edit',
	routeName: 'empresaedit',
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

const EmpresaEditPage = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	// form validation schema
	const validationSchema = yup.object().shape({
		nombre: yup.string().required().label("Nombre"),
		rfc: yup.string().required().label("Rfc"),
		direccion: yup.string().nullable().label("Direccion"),
		ciudad: yup.string().nullable().label("Ciudad"),
		estado: yup.string().nullable().label("Estado"),
		pais: yup.string().nullable().label("Pais"),
		codigo_postal: yup.string().nullable().label("Codigo Postal"),
		telefono: yup.string().nullable().label("Telefono"),
		email: yup.string().email().nullable().label("Email"),
		logo: yup.string().nullable().label("Logo"),
		regimen_fiscal: yup.string().nullable().label("Regimen Fiscal")
	});

	// form default values
	const formDefaultValues = {
		nombre: '', 
		rfc: '', 
		direccion: '', 
		ciudad: '', 
		estado: '', 
		pais: '', 
		codigo_postal: '', 
		telefono: '', 
		email: '', 
		logo: '', 
		regimen_fiscal: '', 
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
			app.navigate(`/empresa`);
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
<main id="EmpresaEditPage" className="main-page">
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
                    <Title title="Edit Empresa"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-pencil" avatarSize="large"    separator={false} />
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
                                                Rfc *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="rfc"  onChange={formik.handleChange}  value={formik.values.rfc}   label="Rfc" type="text" placeholder="Enter Rfc"        className={inputClassName(formik?.errors?.rfc)} />
                                                <ErrorMessage name="rfc" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Direccion 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="direccion"  onChange={formik.handleChange}  value={formik.values.direccion}   label="Direccion" type="text" placeholder="Enter Direccion"        className={inputClassName(formik?.errors?.direccion)} />
                                                <ErrorMessage name="direccion" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Ciudad 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="ciudad"  onChange={formik.handleChange}  value={formik.values.ciudad}   label="Ciudad" type="text" placeholder="Enter Ciudad"        className={inputClassName(formik?.errors?.ciudad)} />
                                                <ErrorMessage name="ciudad" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Estado 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="estado"  onChange={formik.handleChange}  value={formik.values.estado}   label="Estado" type="text" placeholder="Enter Estado"        className={inputClassName(formik?.errors?.estado)} />
                                                <ErrorMessage name="estado" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Pais 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="pais"  onChange={formik.handleChange}  value={formik.values.pais}   label="Pais" type="text" placeholder="Enter Pais"        className={inputClassName(formik?.errors?.pais)} />
                                                <ErrorMessage name="pais" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Codigo Postal 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="codigo_postal"  onChange={formik.handleChange}  value={formik.values.codigo_postal}   label="Codigo Postal" type="text" placeholder="Enter Codigo Postal"        className={inputClassName(formik?.errors?.codigo_postal)} />
                                                <ErrorMessage name="codigo_postal" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Telefono 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="telefono"  onChange={formik.handleChange}  value={formik.values.telefono}   label="Telefono" type="text" placeholder="Enter Telefono"        className={inputClassName(formik?.errors?.telefono)} />
                                                <ErrorMessage name="telefono" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Email 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="email"  onChange={formik.handleChange}  value={formik.values.email}   label="Email" type="email" placeholder="Enter Email"        className={inputClassName(formik?.errors?.email)} />
                                                <ErrorMessage name="email" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Logo 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="logo"  onChange={formik.handleChange}  value={formik.values.logo}   label="Logo" type="text" placeholder="Enter Logo"        className={inputClassName(formik?.errors?.logo)} />
                                                <ErrorMessage name="logo" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Regimen Fiscal 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="regimen_fiscal"  onChange={formik.handleChange}  value={formik.values.regimen_fiscal}   label="Regimen Fiscal" type="text" placeholder="Enter Regimen Fiscal"        className={inputClassName(formik?.errors?.regimen_fiscal)} />
                                                <ErrorMessage name="regimen_fiscal" component="span" className="p-error" />
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
export default EmpresaEditPage;
