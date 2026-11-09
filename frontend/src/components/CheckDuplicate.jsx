import  { useState } from "react";
import useApi from 'src/hooks/useApi';

const CheckDuplicate = (props) => {
	const [exist, setExist] = useState(false);
	const [loading, setLoading] = useState(false);
	const api = useApi();
	
	const { apiPath, value } = props;
	async function check() {
		const val = encodeURIComponent(value.trim());;
		if (val) {
			setLoading(true);
			const result = await api.get(`${apiPath}/${val}`);
			if(result?.data.toString() === 'true'){
				setExist(true)
			}
			else{
				setExist(false)
			}
			
			setLoading(false);
		}
	}
	return props.children({ loading, check, exist });
}

export { CheckDuplicate }