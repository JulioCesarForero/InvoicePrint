
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
	primaryKey: 'cliente_id',
	pageName: 'clientes',
	apiPath: 'clientes/edit',
	routeName: 'clientesedit',
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

const ClientesEditPage = (componentProps) => {

	const props = {
		...defaultProps,
		...componentProps
	}
		const app = useApp();
	// form validation schema
	const validationSchema = yup.object().shape({
		title: yup.string().nullable().label("Title"),
		first_name: yup.string().required().label("First Name"),
		last_name: yup.string().required().label("Last Name"),
		rfc: yup.string().nullable().label("Rfc"),
		email: yup.string().email().nullable().label("Email"),
		phone: yup.string().nullable().label("Phone"),
		address: yup.string().nullable().label("Address"),
		city: yup.string().nullable().label("City"),
		state: yup.string().nullable().label("State"),
		country: yup.string().nullable().label("Country"),
		zipcode: yup.string().nullable().label("Zipcode")
	});

	// form default values
	const formDefaultValues = {
		title: '', 
		first_name: '', 
		last_name: '', 
		rfc: '', 
		email: '', 
		phone: '', 
		address: '', 
		city: '', 
		state: '', 
		country: '', 
		zipcode: '', 
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
			app.navigate(`/clientes`);
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
<main id="ClientesEditPage" className="main-page">
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
                    <Title title="Edit Cliente"   titleClass="text-2xl text-primary font-bold" subTitleClass="text-gray-500" iconClass="pi pi-pencil" avatarSize="large"    separator={false} />
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
                                                Title 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="title"  onChange={formik.handleChange}  value={formik.values.title}   label="Title" type="text" placeholder="Enter Title"        className={inputClassName(formik?.errors?.title)} />
                                                <ErrorMessage name="title" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                First Name *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="first_name"  onChange={formik.handleChange}  value={formik.values.first_name}   label="First Name" type="text" placeholder="Enter First Name"        className={inputClassName(formik?.errors?.first_name)} />
                                                <ErrorMessage name="first_name" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Last Name *
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="last_name"  onChange={formik.handleChange}  value={formik.values.last_name}   label="Last Name" type="text" placeholder="Enter Last Name"        className={inputClassName(formik?.errors?.last_name)} />
                                                <ErrorMessage name="last_name" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Rfc 
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
                                                Phone 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="phone"  onChange={formik.handleChange}  value={formik.values.phone}   label="Phone" type="text" placeholder="Enter Phone"        className={inputClassName(formik?.errors?.phone)} />
                                                <ErrorMessage name="phone" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Address 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="address"  onChange={formik.handleChange}  value={formik.values.address}   label="Address" type="text" placeholder="Enter Address"        className={inputClassName(formik?.errors?.address)} />
                                                <ErrorMessage name="address" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                City 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="city"  onChange={formik.handleChange}  value={formik.values.city}   label="City" type="text" placeholder="Enter City"        className={inputClassName(formik?.errors?.city)} />
                                                <ErrorMessage name="city" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                State 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="state"  onChange={formik.handleChange}  value={formik.values.state}   label="State" type="text" placeholder="Enter State"        className={inputClassName(formik?.errors?.state)} />
                                                <ErrorMessage name="state" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Country 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="country"  onChange={formik.handleChange}  value={formik.values.country}   label="Country" type="text" placeholder="Enter Country"        className={inputClassName(formik?.errors?.country)} />
                                                <ErrorMessage name="country" component="span" className="p-error" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-full md:col-span-3">
                                                Zipcode 
                                            </div>
                                            <div className="col-span-full md:col-span-9">
                                                <InputText name="zipcode"  onChange={formik.handleChange}  value={formik.values.zipcode}   label="Zipcode" type="text" placeholder="Enter Zipcode"        className={inputClassName(formik?.errors?.zipcode)} />
                                                <ErrorMessage name="zipcode" component="span" className="p-error" />
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
export default ClientesEditPage;
