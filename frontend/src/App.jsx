
import { Routes, Route } from 'react-router';


import IndexLayout from 'layouts/IndexLayout';
import MainLayout from 'layouts/MainLayout';
import ClientesList from 'src/pages/clientes/List';
import ClientesView from 'src/pages/clientes/View';
import ClientesAdd from 'src/pages/clientes/Add';
import ClientesEdit from 'src/pages/clientes/Edit';
import DetallesfacturaList from 'src/pages/detallesfactura/List';
import DetallesfacturaView from 'src/pages/detallesfactura/View';
import DetallesfacturaAdd from 'src/pages/detallesfactura/Add';
import DetallesfacturaEdit from 'src/pages/detallesfactura/Edit';
import EmpresaList from 'src/pages/empresa/List';
import EmpresaView from 'src/pages/empresa/View';
import EmpresaAdd from 'src/pages/empresa/Add';
import EmpresaEdit from 'src/pages/empresa/Edit';
import FacturasList from 'src/pages/facturas/List';
import FacturasView from 'src/pages/facturas/View';
import FacturasAdd from 'src/pages/facturas/Add';
import FacturasEdit from 'src/pages/facturas/Edit';
import ImpuestosList from 'src/pages/impuestos/List';
import ImpuestosView from 'src/pages/impuestos/View';
import ImpuestosAdd from 'src/pages/impuestos/Add';
import ImpuestosEdit from 'src/pages/impuestos/Edit';
import PagosList from 'src/pages/pagos/List';
import PagosView from 'src/pages/pagos/View';
import PagosAdd from 'src/pages/pagos/Add';
import PagosEdit from 'src/pages/pagos/Edit';
import ProductosList from 'src/pages/productos/List';
import ProductosView from 'src/pages/productos/View';
import ProductosAdd from 'src/pages/productos/Add';
import ProductosEdit from 'src/pages/productos/Edit';
import SeriesfoliosList from 'src/pages/seriesfolios/List';
import SeriesfoliosView from 'src/pages/seriesfolios/View';
import SeriesfoliosAdd from 'src/pages/seriesfolios/Add';
import SeriesfoliosEdit from 'src/pages/seriesfolios/Edit';

import HomePage from 'pages/home/HomePage';
import IndexPages from 'pages/index';
import ErrorPages from 'pages/errors';

import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import 'assets/styles/layout.scss';
import 'src/index.scss';

const App = () => {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/home" element={<HomePage />} />
				

				{/* clientes pages routes */}
				<Route path="/clientes" element={<ClientesList />} />
				<Route path="/clientes/:fieldName/:fieldValue" element={<ClientesList />} />
				<Route path="/clientes/index/:fieldName/:fieldValue" element={<ClientesList />} />
				<Route path="/clientes/view/:pageid" element={<ClientesView />} />
				<Route path="/clientes/add" element={<ClientesAdd />} />
				<Route path="/clientes/edit/:pageid" element={<ClientesEdit />} />

				{/* detallesfactura pages routes */}
				<Route path="/detallesfactura" element={<DetallesfacturaList />} />
				<Route path="/detallesfactura/:fieldName/:fieldValue" element={<DetallesfacturaList />} />
				<Route path="/detallesfactura/index/:fieldName/:fieldValue" element={<DetallesfacturaList />} />
				<Route path="/detallesfactura/view/:pageid" element={<DetallesfacturaView />} />
				<Route path="/detallesfactura/add" element={<DetallesfacturaAdd />} />
				<Route path="/detallesfactura/edit/:pageid" element={<DetallesfacturaEdit />} />

				{/* empresa pages routes */}
				<Route path="/empresa" element={<EmpresaList />} />
				<Route path="/empresa/:fieldName/:fieldValue" element={<EmpresaList />} />
				<Route path="/empresa/index/:fieldName/:fieldValue" element={<EmpresaList />} />
				<Route path="/empresa/view/:pageid" element={<EmpresaView />} />
				<Route path="/empresa/add" element={<EmpresaAdd />} />
				<Route path="/empresa/edit/:pageid" element={<EmpresaEdit />} />

				{/* facturas pages routes */}
				<Route path="/facturas" element={<FacturasList />} />
				<Route path="/facturas/:fieldName/:fieldValue" element={<FacturasList />} />
				<Route path="/facturas/index/:fieldName/:fieldValue" element={<FacturasList />} />
				<Route path="/facturas/view/:pageid" element={<FacturasView />} />
				<Route path="/facturas/add" element={<FacturasAdd />} />
				<Route path="/facturas/edit/:pageid" element={<FacturasEdit />} />

				{/* impuestos pages routes */}
				<Route path="/impuestos" element={<ImpuestosList />} />
				<Route path="/impuestos/:fieldName/:fieldValue" element={<ImpuestosList />} />
				<Route path="/impuestos/index/:fieldName/:fieldValue" element={<ImpuestosList />} />
				<Route path="/impuestos/view/:pageid" element={<ImpuestosView />} />
				<Route path="/impuestos/add" element={<ImpuestosAdd />} />
				<Route path="/impuestos/edit/:pageid" element={<ImpuestosEdit />} />

				{/* pagos pages routes */}
				<Route path="/pagos" element={<PagosList />} />
				<Route path="/pagos/:fieldName/:fieldValue" element={<PagosList />} />
				<Route path="/pagos/index/:fieldName/:fieldValue" element={<PagosList />} />
				<Route path="/pagos/view/:pageid" element={<PagosView />} />
				<Route path="/pagos/add" element={<PagosAdd />} />
				<Route path="/pagos/edit/:pageid" element={<PagosEdit />} />

				{/* productos pages routes */}
				<Route path="/productos" element={<ProductosList />} />
				<Route path="/productos/:fieldName/:fieldValue" element={<ProductosList />} />
				<Route path="/productos/index/:fieldName/:fieldValue" element={<ProductosList />} />
				<Route path="/productos/view/:pageid" element={<ProductosView />} />
				<Route path="/productos/add" element={<ProductosAdd />} />
				<Route path="/productos/edit/:pageid" element={<ProductosEdit />} />

				{/* seriesfolios pages routes */}
				<Route path="/seriesfolios" element={<SeriesfoliosList />} />
				<Route path="/seriesfolios/:fieldName/:fieldValue" element={<SeriesfoliosList />} />
				<Route path="/seriesfolios/index/:fieldName/:fieldValue" element={<SeriesfoliosList />} />
				<Route path="/seriesfolios/view/:pageid" element={<SeriesfoliosView />} />
				<Route path="/seriesfolios/add" element={<SeriesfoliosAdd />} />
				<Route path="/seriesfolios/edit/:pageid" element={<SeriesfoliosEdit />} />
			</Route>
			<Route exact element={<IndexLayout />}>
				<Route path="/*" element={<IndexPages />} />
				<Route path="/error/*" element={<ErrorPages />} />
			</Route>
		</Routes>
	);
}
export default App;
