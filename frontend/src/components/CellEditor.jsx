import React, { useState, useEffect } from 'react';
import useApi from 'hooks/useApi';
import { DataSource } from 'components/DataSource';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Slider } from 'primereact/slider';

const CellEditor = (props) => {
	const { type = "text", options } = props;
	if (type === "number") {
		return <InputNumber className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
	}
	else if (type === "range") {
		return (<>
			<InputText className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
			<Slider className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
		</>);
	}
	else if (type === "select") {
		if (props.apiPath) {
			return <DataSource apiPath={props.apiPath} element={({ loading, response, error }) => <Dropdown className="w-full" optionLabel="label" optionValue="value" options={response} value={options.value} onChange={(e) => options.editorCallback(e.value)} />} />
		}
		else if (props.dataSource) {
			return <Dropdown className="w-full" optionLabel="label" optionValue="value" options={props.dataSource} value={options.value} onChange={(e) => options.editorCallback(e.value)} />
		}
	}
	else if (type === "date") {
		return <Calendar showTime={false} className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
	}
	else if (type === "datetime") {
		return <Calendar showTime={true} className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
	}
	else if (type === "time") {
		return <Calendar timeOnly={true} showIcon={true} showButtonBar={true} dateFormat="yy-mm-dd" hourFormat="24" className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.value)} />
	}
	else {
		return <InputText className="w-full" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />
	}
}

export { CellEditor }