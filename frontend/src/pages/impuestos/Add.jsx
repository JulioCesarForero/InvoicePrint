
import { Formik, Form, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import useApp from 'hooks/useApp';

import useAddPage from 'hooks/useAddPage';
const defaultProps = {
	primaryKey: 'impuesto_id',
	pageName: 'impuestos',
	apiPath: 'impuestos/add',
	routeName: 'impuestosadd',
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

const ImpuestosAddPage = (componentProps) => {
	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	
	//form validation rules
	const validationSchema = yup.object().shape({
		nombre: yup.string().required().label("Nombre"),
		codigo: yup.string().required().label("Codigo"),
		tasa: yup.number().required().label("Tasa"),
		activo: yup.string().required().label("Activo")
	});

	
	//form default values
	const formDefaultValues = {
		nombre: '', 
		codigo: '', 
		tasa: '', 
		activo: '', 
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
			app.navigate(`/impuestos`);
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
<main id="ImpuestosAddPage" className="main-page">
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
                    <Title title="Add Impuesto"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-plus" avatarSize="large"    separator={false} />
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
                                                Tasa *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="tasa"  onChange={formik.handleChange}  value={formik.values.tasa}   label="Tasa" type="number" placeholder="Enter Tasa"  min={0}  step={0.1}    className={inputClassName(formik?.errors?.tasa)} />
                                                <ErrorMessage name="tasa" component="span" className="p-error" />
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

export default ImpuestosAddPage;
