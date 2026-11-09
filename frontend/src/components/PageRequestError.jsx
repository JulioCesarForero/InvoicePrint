import PageNotFound from 'src/pages/errors/PageNotFound';
import Forbidden from 'src/pages/errors/Forbidden';
import ServerError from 'src/pages/errors/ServerError';

const PageRequestError = (props) => {
	const error = props.error;
	const { status = 500, data = "Unable to process request." } = error.response;
	if(status === 404){
		return <PageNotFound message={data} />
	}
	else if(status === 403){
		return <Forbidden message={data} />
	}
	return (
		<ServerError message={data} />
	)
}

export { PageRequestError }