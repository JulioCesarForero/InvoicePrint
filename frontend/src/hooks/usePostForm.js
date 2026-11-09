import { useState } from "react";
import { useFormik } from 'formik';
import { useMutation} from '@tanstack/react-query';

import useApi from 'hooks/useApi';

const usePostForm = ({ formUrl, formDefaultValues, validationSchema, afterSubmit, onError }) => {
	const api = useApi();
	const [errorMsg, setErrorMsg] = useState(null);

	const [formData, setFormData] = useState(formDefaultValues);

	function submitFormData(postData) {
		return api.post(formUrl, postData).then((res) => res.data);
	}

	const mutation = useMutation({
		mutationFn: submitFormData,
		onSuccess: (data) => {
			setFormData(data);
			if(typeof afterSubmit === 'function'){
				afterSubmit(data);
			}
		},
		onError: (error) => {
			const errMsg = error?.response?.data || "Unable to send request";
			setErrorMsg(errMsg);
			if(typeof onError === 'function'){
				onError(errMsg);
			}
		},
		retry: false,
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: formData,
		validationSchema: validationSchema,
		onSubmit: async (validatedFormData) => {
			submitForm(validatedFormData);
		}
	});

	function submitForm(validatedFormData) {
		setErrorMsg(null);
		mutation.mutate(validatedFormData);
	}

	function inputClassName(errorMsg, className = 'w-full') {
		if (errorMsg) {
			return `${className} p-invalid`;
		}
		return className;
	}

	return {
		formData,
		setFormData,
		submitForm,
		loading: mutation.isPending,
		errorMsg,
		setErrorMsg,
		inputClassName,
		formik
	}
}

export default usePostForm