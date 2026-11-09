import { Button } from 'primereact/button';
import useApi from 'hooks/useApi';
import useApp from 'hooks/useApp';
import useUtils from 'hooks/useUtils';

// Impresión de la factura con el reporte propio (/api/facturas/imprimir/<id>).
// Componente propio: no lo genera RadSystems, así que no se pierde al regenerar.
export function useImprimirFactura() {
	const api = useApi();
	const app = useApp();
	const utils = useUtils();

	async function descargarPdf(facturaId) {
		app.showAppLoading("Generando factura...");
		try {
			const response = await api.download(`facturas/imprimir/${facturaId}?format=pdf`);
			const disposition = response.headers?.['content-disposition'] || '';
			const match = /filename="?([^";]+)"?/i.exec(disposition);
			const fileName = match ? match[1] : `factura-${facturaId}.pdf`;
			const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', fileName);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		}
		catch (error) {
			console.error(error);
			app.flashMsg('Imprimir factura', 'No se pudo generar el PDF de la factura.', 'error');
		}
		finally {
			app.showAppLoading(false);
		}
	}

	function vistaPrevia(facturaId) {
		window.open(utils.setApiPath(`facturas/imprimir/${facturaId}`, { format: 'html' }), '_blank', 'noopener');
	}

	return { descargarPdf, vistaPrevia };
}

export function ImprimirFacturaButtons({ facturaId }) {
	const { descargarPdf, vistaPrevia } = useImprimirFactura();
	if (!facturaId) return null;
	return (
		<div className="flex gap-2">
			<Button label="Imprimir factura" icon="pi pi-file-pdf" onClick={() => descargarPdf(facturaId)} tooltip="Descargar la factura en PDF" />
			<Button label="Vista previa" icon="pi pi-external-link" className="p-button-outlined" onClick={() => vistaPrevia(facturaId)} tooltip="Abrir la factura en una pestaña nueva" />
		</div>
	);
}
