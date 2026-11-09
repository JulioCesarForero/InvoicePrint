import React, { createContext, useState, useRef, useEffect } from 'react';
import { locale, updateLocaleOptions } from 'primereact/api';
import { setLocale } from 'yup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import { Carousel } from 'primereact/carousel';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNavigate } from "react-router";

import useMenus from "src/hooks/useMenus";
import { Image } from 'src/components/ImageViewer';
import { i18n, $t } from 'src/hooks/i18n';

export const AppContext = createContext();


export const AppProvider = ({ children }) => {
	const toast = useRef(null);
	const menus = useMenus();
	const navigate = useNavigate();

	const dialogProps = {
		seamless: false,
		position: 'standard',
		persistent: false,
		maximized: false,
		closeBtn: false,
		width: '50vw',
		title: '...',
	}
	const drawerProps = {
		width: '400px', // default width
	}

	const [dialogPageComponent, setDialogPageComponent] = useState(null);
	const [drawerPageComponent, setDrawerPageComponent] = useState(null);
	const [pageDialog, setPageDialog] = useState(false);
	const [pageDialogProps, setPageDialogProps] = useState(dialogProps);

	const [rightDrawer, setRightDrawer] = useState(false);
	const [rightDrawerProps, setRightDrawerProps] = useState(drawerProps);

	const [imageDialog, setImageDialog] = useState(false);
	const [imageDialogProps, setImageDialogProps] = useState({});

	const [fullScreenLoading, setFullScreenLoading] = useState(false);
	const [fullScreenLoadingMsg, setFullScreenLoadingMsg] = useState(null);
	const [localeName, setLocaleName] = useState(null);
	const [pages, setPages] = useState({});

	function flashMsg(title, detail, type) {
		if (title || detail) {
			let severity = type || "success";
			toast.current.show({ severity, summary: title, detail, life: 3000 });
		}
	}

	function isDialogOpen() {
		if (pageDialog || rightDrawer) return true;
		return false;
	}

	function openPageDialog(page, props) {
		setDialogPageComponent(page);
		setPageDialogProps({ ...dialogProps, ...props });
		setPageDialog(true);
	}

	function openPageDrawer(page, props) {
		setDrawerPageComponent(page);
		setRightDrawerProps({ ...drawerProps, ...props });
		setRightDrawer(true);
	}

	function openImageDialog(dialogProps) {
		setImageDialogProps(dialogProps);
		setImageDialog(true);
	}

	function closeDialogs() {
		setRightDrawer(false);
		setPageDialog(false);

		setImageDialog(false);
	}

	function showPageRequestError(error) {
		console.error(error);
		const defaultMsg = error || $t('requestFailed');  // if error is not a api request error.
		let errorList = [defaultMsg];
		if (error?.request?.response) {
			let errorData = error.request.response;
			if (typeof (errorData) === 'string') {
				try {
					// if error message is valid json data
					errorData = JSON.parse(errorData);
				}
				catch (ex) {
					//not a valid json. Display as simple message
					//console.error(ex);
				}
			}
			if (Array.isArray(errorData)) {
				errorList = errorData;
			}
			else if (typeof (errorData) === 'object') {
				errorList = Object.values(errorData);
			}
			else {
				errorList = [errorData.toString()]
			}
		}

		const detail = errorList.join('\n');
		const summary = $t('requestError');
		const severity = 'error';
		const duration = 5000;
		toast.current.show({ severity, summary, detail, life: duration });

	}

	function showAppLoading(msg) {
		if (msg) {
			setFullScreenLoadingMsg(msg);
			setFullScreenLoading(true);
		}
		else {
			setFullScreenLoadingMsg(null);
			setFullScreenLoading(false);
		}
	}

	function imagePreviewTemplate(imgSrc) {
		if (imgSrc) {
			return (
				<Image imageSize="large" preview={false} src={imgSrc} width="auto" height="auto" style={{ maxWidth: '100%', maxHeight: '60vh' }} />
			);
		}
	}

	function imageDialogTemplate() {
		const images = imageDialogProps.images || [];
		if (images.length > 1) {
			return (
				<div className="text-center">
					<Carousel style={{ width: '100%' }} value={images} itemTemplate={imagePreviewTemplate} circular={false} page={imageDialogProps.currentSlide} />
				</div>
			);
		}
		else if (images.length === 1) {
			return (imagePreviewTemplate(imageDialogProps?.images[0]))
		}
	}
	function getImageDialogWidth() {
		const images = imageDialogProps.images || [];
		if (images.length > 1) {
			return '50vw';
		}
		return 'auto'
	}

	function setAppLocale() {

		try {
			const localeName = i18n.locale;
			if (localeName) {
				let localeMessages = i18n.messages;

				//set prime react locale
				locale(localeName);
				updateLocaleOptions(localeMessages, localeName);
				setLocaleName(localeName);

				//build yup validations locale
				const yupLocales = {
					mixed: {
						default: i18n.t('validations.required'),
						required: i18n.t('validations.required'),
					},
					string: {
						email: i18n.t('validations.email'),
						ipAddress: i18n.t('validations.ipAddress'),
						min: ({ min }) => i18n.t('validations.minLength', { min }),
						max: ({ max }) => i18n.t('validations.maxLength', { max })
					},
					number: {
						default: i18n.t('validations.numeric'),
						numeric: i18n.t('validations.numeric'),
						min: ({ min }) => i18n.t('validations.minValue', { min }),
						max: ({ max }) => i18n.t('validations.maxValue', { max })
					}
				};
				//set yup locales
				setLocale(yupLocales);
			}
		}
		catch (err) {
			console.error(err);
		}
	}

	function setPageData(page, pageData) {
		const currentPage = pages[page];
		if (currentPage) {
			currentPage.pageData = pageData;
		}
		else {
			pages[page] = {
				pageData
			};
		}
		setPages(pages);
	}

	function getPageData(page) {
		const currentPage = pages[page];
		if (currentPage) {
			return currentPage.pageData;
		}
		return null;
	}

	function setPageFormData(page, formData) {
		const currentPage = pages[page];
		if (currentPage) {
			currentPage.formData = formData;
		}
		else {
			pages[page] = {
				formData
			}
		}
		setPages(pages);
	}

	function getPageFormData(page) {
		const currentPage = pages[page];
		if (currentPage) {
			return currentPage.formData;
		}
		return {};
	}

	useEffect(() => {
		setAppLocale();
	}, []);

	return (
		<AppContext.Provider
			value={{
				menus,
				localeName,
				navigate,
				flashMsg,
				isDialogOpen,
				openPageDialog,
				openPageDrawer,
				openImageDialog,
				closeDialogs,
				showPageRequestError,
				showAppLoading,
				setFullScreenLoading,
				setPageData,
				getPageData,
				setPageFormData,
				getPageFormData,
			}}
		>
			{children}
			<Toast ref={toast} position="top-center"></Toast>
			<ConfirmDialog />

			<Sidebar visible={rightDrawer} position="right" onHide={() => setRightDrawer(false)} style={{ width: rightDrawerProps.width, maxWidth: '90%' }}>
				{drawerPageComponent}
			</Sidebar>

			<Dialog breakpoints={{ '960px': '40vw', '640px': '95vw' }} className="card py-4 px-2" position={pageDialogProps.position} modal={!pageDialogProps.persistent} draggable={false} dismissableMask={!pageDialogProps.seamless} visible={pageDialog} onHide={() => setPageDialog(false)} style={{ width: pageDialogProps.width }} showHeader={false}>
				{
					pageDialogProps.closeBtn &&
					<Button onClick={() => setPageDialog(false)} style={{ position: 'absolute', right: '25px', top: '15px' }} icon="pi pi-times" className="p-button-rounded p-button-text p-button-plain" />
				}
				{dialogPageComponent}
			</Dialog>

			{/* <!-- image preview dialog--> */}
			<Dialog header="..." showHeader={true} breakpoints={{ '960px': '40vw', '640px': '95vw' }} style={{ width: getImageDialogWidth() }} visible={imageDialog} dismissableMask modal={true} onHide={() => setImageDialog(false)}>
				{imageDialogTemplate()}
			</Dialog>

			<Dialog className="card m-0 text-center" showHeader={false} modal visible={fullScreenLoading} breakpoints="{ '960px': '50vw', '640px': '95vw' }" style={{ width: '10vw' }} position="center" onHide={() => setFullScreenLoading(false)}>
				<ProgressSpinner style={{ width: '40px' }} />
				{fullScreenLoadingMsg}
			</Dialog>

		</AppContext.Provider >
	);
};