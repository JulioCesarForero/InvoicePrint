/**
 * @Category React Hook function
 * Provide single source to manage application static menus items
 * 
**/




export default function useMenus() {
    
    
    return {
	navbarTopRight: [],
	navbarSideLeft: [
  {
    "to": "/home",
    "label": "Home",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/clientes",
    "label": "Clientes",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/detallesfactura",
    "label": "Detalles Factura",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/empresa",
    "label": "Empresa",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/facturas",
    "label": "Facturas",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/impuestos",
    "label": "Impuestos",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/pagos",
    "label": "Pagos",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/productos",
    "label": "Productos",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  },
  {
    "to": "/seriesfolios",
    "label": "Series Folios",
    "icon": "pi pi-th-large",
    "iconcolor": "",
    "target": "",
  }
],
        exportFormats: {
            print: {
                label: 'Print',
                icon: 'pi pi-print',
                type: 'print',
                ext: '',
            },
            pdf: {
                label: 'Pdf',

                icon: 'pi pi-file-pdf',
                type: 'pdf',
                ext: 'pdf',
            },
            excel: {
                label: 'Excel',
                icon: 'pi pi-file-excel',
                type: 'excel',
                ext: 'xlsx',
            },
            csv: {
                label: 'Csv',
                icon: 'pi pi-table',
                type: 'csv',
                ext: 'csv',
            },
        },
    }
}