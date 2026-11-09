import React, { useState, useEffect } from "react";
import { useImage } from 'react-img-placeholder'
import { ProgressSpinner } from "primereact/progressspinner";

import useUtils from 'src/hooks/useUtils';
import useApp from 'src/hooks/useApp';

const imageDefaultProps = {
	src: '',
	className: 'rounded',
	imageSize: 'small', //small, medium, large
	previewSize: 'large', //small, medium, large
	preview: true,
	width: 50,
	height: 50,
	index: 0,
	images: []
}

const Image = (componentProps) => {
	const props = { ...imageDefaultProps, ...componentProps };
	const app = useApp();
	const utils = useUtils();
	let { src, width, height, imageSize, preview, previewSize, style, images, index, alt, className, ...otherProps } = props;
	const imgSizePath = utils.setImgUrl(src, imageSize);
	const { isLoaded, isError } = useImage({ src: imgSizePath });

	function openGallery(index) {
		if (preview) {
			let payload = {
				currentSlide: index,
				images: getLargeImages()
			}
			app.openImageDialog(payload);
		}
	}

	function getLargeImages() {
		let largeImages = [];
		images.forEach((path) => {
			if (previewSize) {
				let imgUrl = utils.setImgUrl(path, previewSize);
				largeImages.push(imgUrl);
			}
			else {
				let imgUrl = utils.getFileFullPath(path);
				largeImages.push(imgUrl);
			}
		});
		return largeImages;
	}

	let imgTag;

	if (!src) {//if image src is empty
		imgTag = (<i className="text-400 pi pi-image text-5xl"></i>);
	}
	else if (isError) { //image link is broken
		imgTag = (<i className="text-pink-600 pi pi-info-circle text-5xl"></i>);
	} else if (!isLoaded) { //image is loading
		imgTag = (<ProgressSpinner style={{ width: '40px', height: '40px' }} />);
	}
	else { //image has loaded
		if (preview) {
			className += " cursor-pointer";
		}

		imgTag = (<img onClick={() => openGallery(index)} src={imgSizePath} alt={alt} className={className} style={{ width, height, ...style }} />);
	}
	return (<div style={{ width, height, ...style }} {...otherProps} className="flex justify-content-center align-items-center text-center">
			{imgTag}
		</div>);
}

const ImageViewerDefaultProps = {
	src: '',
	numDisplay: 1,
	previewSize: 'large', //small, medium, large
	preview: true,
}

const ImageViewer = (componentProps) => {
	const props = { ...ImageViewerDefaultProps, ...componentProps };

	let { src, numDisplay, width, height, style, preview, previewSize, imageSize, ...otherProps } = props;
	const [images, setImages] = useState([]);

	useEffect(() => {
		//split img src if mutiple src separated by comma(,)
		if (src) {
			const imgPaths = src.toString().split(",");
			setImages(imgPaths);
		}
	}, [src]);
	if (src) {
		return (
			<div className="flex gap-2">
				{images.map((img, index) => {
					if (index < numDisplay) {
						return (
							<div className="flex-1" key={index}>
								<Image images={images} style={{ width, height, ...style }} preview={preview} previewSize={previewSize} imageSize={imageSize} src={img} index={index} {...otherProps} />
							</div>
						);
					}
					return null;
				})}
			</div>
		);
	}
	width = width || '50px';
	height = height || '50px';
	return (
		<div style={{ height, width }} {...otherProps} className="flex justify-content-center align-items-center text-center surface-100">
			<div className="flex-1"><i className="text-400 pi pi-image text-5xl"></i></div>
		</div>);
}

export { ImageViewer, Image };