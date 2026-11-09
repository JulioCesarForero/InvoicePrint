import { SplitButton } from 'primereact/splitbutton';
import useApi from 'hooks/useApi';
import useApp from 'hooks/useApp';
import useUtils from 'hooks/useUtils';

// Impresión de facturas con el módulo facturacion_pdf (/api/facturas/imprimir/...).
// motor: 'weasyprint' | 'wkhtmltopdf' | undefined (usa el motor por defecto del servidor, PDF_MOTOR)
// Componente propio: no lo genera RadSystems, así que no se pierde al regenerar.
export function useImprimirFactura() {
	const api = useApi();
	const app = useApp();
	const utils = useUtils();

	function ruta(facturaId, params = {}) {
		const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
		return `facturas/imprimir/${facturaId}${qs ? `?${qs}` : ''}`;
	}

	async function descargarPdf(facturaId, motor) {
		app.showAppLoading(`Generando factura${motor ? ` con ${motor}` : ''}...`);
		try {
			const response = await api.download(ruta(facturaId, { format: 'pdf', motor }));
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
			let detalle = 'No se pudo generar el PDF de la factura.';
			try { detalle = JSON.parse(await error?.response?.data?.text())?.error || detalle; } catch { /* respuesta no JSON */ }
			app.flashMsg('Imprimir factura', detalle, 'error');
		}
		finally {
			app.showAppLoading(false);
		}
	}

	function abrir(path) {
		window.open(utils.setApiPath(path), '_blank', 'noopener');
	}

	return {
		descargarPdf,
		vistaPrevia: (facturaId, motor) => abrir(ruta(facturaId, { format: 'html', motor })),
		compararMotores: (facturaId) => abrir(`facturas/imprimir/${facturaId}/comparar`),
	};
}

export function ImprimirFacturaButtons({ facturaId }) {
	const { descargarPdf, vistaPrevia, compararMotores } = useImprimirFactura();
	if (!facturaId) return null;
	const opciones = [
		{ label: 'PDF con WeasyPrint', icon: 'pi pi-file-pdf', command: () => descargarPdf(facturaId, 'weasyprint') },
		{ label: 'PDF con wkhtmltopdf', icon: 'pi pi-file-pdf', command: () => descargarPdf(facturaId, 'wkhtmltopdf') },
		{ separator: true },
		{ label: 'Vista previa (HTML)', icon: 'pi pi-external-link', command: () => vistaPrevia(facturaId) },
		{ label: 'Comparar motores', icon: 'pi pi-clone', command: () => compararMotores(facturaId) },
	];
	return (
		<SplitButton label="Imprimir factura" icon="pi pi-file-pdf" model={opciones}
			onClick={() => descargarPdf(facturaId)} tooltip="Descargar la factura en PDF (motor por defecto)" />
	);
}
