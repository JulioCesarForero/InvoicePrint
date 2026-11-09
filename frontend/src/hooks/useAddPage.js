import { useState, useMemo } from "react";

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { confirmDialog } from 'primereact/confirmdialog';

import useApi from 'hooks/useApi';
import useApp from 'hooks/useApp';
const useAddPage = ({ props, formDefaultValues, afterSubmit }) => {
	const app = useApp();

	const api = useApi();

	const [pageReady] = useState(true);

	const contextFormData = app.getPageFormData(props.pageName); // from data from store

	const propsFormData = props.formData; // when form default values is passed by component props

	const computedFormData = { ...formDefaultValues, ...propsFormData, ...contextFormData };

	const [formData, setFormData] = useState(computedFormData);

	const queryClient = useQueryClient();

	function resetForm() {
		setFormData(computedFormData);
	}

	function handleSubmit(e, formik) {
		if (!formik.isValid) {
			app.flashMsg(props.formValidationError, props.formValidationMsg, "error");
		}
	}

	function submitFormData(formValues) {
		const url = props.apiPath;
		let postData;
		if (Array.isArray(formValues)) {
			postData = formValues.map(form => normalizeFormData(form));
		}
		else {
			postData = normalizeFormData(formValues)
		}
		return api.post(url, postData).then((res) => res?.data);
	}

	const mutation = useMutation({
		mutationFn: submitFormData,
		retry: false,
		onSuccess: (data) => {
			queryClient.invalidateQueries(props.pageName);
			if (afterSubmit) {
				afterSubmit(data);
			}
		},
		onError: (error) => {
			app.showPageRequestError(error);
		},
	});

	function normalizeFormData(formValues) {
		if (typeof formValues === 'string') {
			return formValues;
		}
		if (Array.isArray(formValues)) {
			return formValues.map(form => normalizeFormData(form));
		}
		if (typeof formValues === 'object') {
			const postData = { ...formValues }
			Object.keys(postData).forEach(function (key) {
				const fieldValue = postData[key];
				if (Array.isArray(fieldValue)) {
					if(fieldValue.every(item => typeof item === "string")){
						postData[key] = fieldValue.toString();
					}
					else{
						postData[key] = normalizeFormData(fieldValue);
					}
				}
				else if (fieldValue instanceof Date) {
					postData[key] = fieldValue.toISOString().slice(0, 19).replace('T', ' ');
				}
				else if (fieldValue === '') {
					postData[key] = null;
				}
			});
			return postData;
		}
		return formValues
	}

	function submitForm(validatedFormData) {
		let confirmMsg = props.msgBeforeSave;
		if (confirmMsg) {
			confirmDialog({
				header: props.msgTitle,
				message: confirmMsg,
				icon: 'pi pi-save',
				accept: async () => {
					mutation.mutate(validatedFormData);
				},
				reject: () => {
					//callback to execute when user rejects the action
				}
			});
		}
		else {
			mutation.mutate(validatedFormData);
		}
	}

	function inputClassName(hasError, className = 'w-full') {
		if (hasError) {
			return `${className} p-invalid`;
		}
		return className;
	}

	const pageData = {
		setFormData,
		submitForm,
		inputClassName,
		resetForm,
		handleSubmit,
		formData,
		pageReady,
		saving: mutation.isPending,
	}

	return useMemo(() => pageData, [formData, pageReady, mutation.isPending]
	);
}
export default useAddPage