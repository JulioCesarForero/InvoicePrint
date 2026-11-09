
import { Formik, Form, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { DataSource } from 'components/DataSource';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Title } from 'components/Title';
import useApp from 'hooks/useApp';

import useAddPage from 'hooks/useAddPage';
const defaultProps = {
	primaryKey: 'serie_folio_id',
	pageName: 'seriesfolios',
	apiPath: 'seriesfolios/add',
	routeName: 'seriesfoliosadd',
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

const SeriesfoliosAddPage = (componentProps) => {
	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	
	//form validation rules
	const validationSchema = yup.object().shape({
		serie: yup.string().required().label("Serie"),
		folio_actual: yup.number().required().label("Folio Actual"),
		folio_inicial: yup.number().required().label("Folio Inicial"),
		folio_final: yup.number().nullable().label("Folio Final"),
		tipo_comprobante: yup.string().required().label("Tipo Comprobante"),
		activo: yup.string().required().label("Activo"),
		empresa_id: yup.string().required().label("Empresa Id")
	});

	
	//form default values
	const formDefaultValues = {
		serie: '', 
		folio_actual: '', 
		folio_inicial: '', 
		folio_final: '', 
		tipo_comprobante: '', 
		activo: '', 
		empresa_id: '', 
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
			app.navigate(`/seriesfolios`);
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
<main id="SeriesfoliosAddPage" className="main-page">
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
                    <Title title="Add Series Folio"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-plus" avatarSize="large"    separator={false} />
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
                                                Serie *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="serie"  onChange={formik.handleChange}  value={formik.values.serie}   label="Serie" type="text" placeholder="Enter Serie"        className={inputClassName(formik?.errors?.serie)} />
                                                <ErrorMessage name="serie" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Folio Actual *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="folio_actual"  onChange={formik.handleChange}  value={formik.values.folio_actual}   label="Folio Actual" type="number" placeholder="Enter Folio Actual"  min={0}  step="any"    className={inputClassName(formik?.errors?.folio_actual)} />
                                                <ErrorMessage name="folio_actual" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Folio Inicial *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="folio_inicial"  onChange={formik.handleChange}  value={formik.values.folio_inicial}   label="Folio Inicial" type="number" placeholder="Enter Folio Inicial"  min={0}  step="any"    className={inputClassName(formik?.errors?.folio_inicial)} />
                                                <ErrorMessage name="folio_inicial" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Folio Final 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="folio_final"  onChange={formik.handleChange}  value={formik.values.folio_final}   label="Folio Final" type="number" placeholder="Enter Folio Final"  min={0}  step="any"    className={inputClassName(formik?.errors?.folio_final)} />
                                                <ErrorMessage name="folio_final" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Tipo Comprobante *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="tipo_comprobante"  onChange={formik.handleChange}  value={formik.values.tipo_comprobante}   label="Tipo Comprobante" type="text" placeholder="Enter Tipo Comprobante"        className={inputClassName(formik?.errors?.tipo_comprobante)} />
                                                <ErrorMessage name="tipo_comprobante" component="span" className="p-error" />
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

export default SeriesfoliosAddPage;
