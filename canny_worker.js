"use strict"

class Uint8ClampedWrapper {
	constructor() {
		this._uint8Data = null;
		this._width  = 0;
		this._height = 0;
	}
	setBufferDefault(width, height) {
		this.clear();
		let length = width * height * 4;
		if (width <= 0 || height <= 0 || length > Number.MAX_SAFE_INTEGER)
			return false;
		
		this._uint8Data = new Uint8ClampedArray(length);
		this._width  = width;
		this._height = height;
		
		let data = this._uint8Data;
		for (let i = 0; i < length; i += 4) {
			data[i + 0] = 0;
			data[i + 1] = 0;
			data[i + 2] = 0;
			data[i + 3] = 255;
		}
		return true;
	}
	setBufferFromImage(image) {
		this.clear();
		
		if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0)
			return false;
		
		let canvas = document.createElement("canvas");
		canvas.width  = image.naturalWidth;
		canvas.height = image.naturalHeight;
		
		let context = canvas.getContext("2d");
		let imageData = null;
		try {
			context.drawImage(image, 0, 0);
			imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		} catch(e) {
			console.log("Uint8ClampedWrapper::setBufferFromImage error");
			console.log("name:    " + e.name);
			console.log("message: " + e.message);
			return false;
		}
		
		this._width  = imageData.width;
		this._height = imageData.height;
		this._uint8Data = new Uint8ClampedArray(imageData.data);
		return true;
	}
	setBufferFromContext(context) {
		this.clear();
		
		let imageData = null;
		try {
			imageData = context.getImageData();
		} catch(e) {
			console.log("Uint8ClampedWrapper::setBufferFromContext error");
			console.log("name:    " + e.name);
			console.log("message: " + e.message);
			return false;
		}
		if (imageData.width === 0 || imageData.height === 0)
			return false;
		
		this._width  = imageData.width;
		this._height = imageData.height;
		this._uint8Data = new Uint8ClampedArray(imageData.data);
		return true;
	}
	setBufferFromUint8Wrapper(wrapper) {
		this.clear();
		
		if (wrapper.empty())
			return false;
		
		this._width  = wrapper.width();
		this._height = wrapper.height();
		this._uint8Data = new Uint8ClampedArray(wrapper.getInnerUint8ClampedArray());
		return true;
	}
	async asyncSetBufferFromFile(file) {
		let wrapper = this;
		wrapper.clear();
		
		let executor = function(resolve, reject) {
			let image = document.createElement("img");
			image.crossOrigin = "anonymous";
			image.onload = function() {
				URL.revokeObjectURL(this.src);
				let flag = wrapper.setBufferFromImage(this);
				if (flag)
					resolve(wrapper);
				else
					reject(new Error("Uint8ClampedWrapper::asyncSetBufferFromFile error! type1"));
			};
			image.onerror = function() {
				console.log("Uint8ClampedWrapper::asyncSetBufferFromFile::image::onerror");
				URL.revokeObjectURL(this.src);
				reject(new Error("Uint8ClampedWrapper::asyncSetBufferFromFile error! type2"));
			};
			image.src = URL.createObjectURL(file);
		};
		return new Promise(executor);
	}
	setBufferFromMoveObject(moveObject) {
		this.clear();
		
		if (!moveObject)
			return false;
		let {_width, _height, _buffer} = moveObject;
		if (!_width || !_height || !_buffer)
			return false;
		
		this._width     = _width;
		this._height    = _height;
		this._uint8Data = new Uint8ClampedArray(moveObject._buffer);
		return true;
	}
	move() {
		let res = {
			_width:  this._width,
			_height: this._height,
			_buffer: this._uint8Data.buffer,
		};
		this.clear();
		return res;
	}
	width() {
		return this._width;
	}
	height() {
		return this._height;
	}
	clear() {
		this._uint8Data = null;
		this._width  = 0;
		this._height = 0;
		return this;
	}
	getRGB(x, y) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		//	return undefined;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		return [buff[index], buff[index + 1], buff[index + 2]];
	}
	getRGBA(x, y) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		//	return undefined;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		return [buff[index], buff[index + 1], buff[index + 2], buff[index + 3]];
	}
	getMid(x, y) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		//	return undefined;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		return Math.round( (buff[index] + buff[index + 1] + buff[index + 2]) / 3 );
	}
	setRGB(x, y, rgb) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height || rgb.length !== 3)
		//	return this;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		buff[index]     = rgb[0];
		buff[index + 1] = rgb[1];
		buff[index + 2] = rgb[2];
		return this;
	}
	setRGBA(x, y, rgba) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height || rgb.length !== 4)
		//	return this;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		buff[index]     = rgba[0];
		buff[index + 1] = rgba[1];
		buff[index + 2] = rgba[2];
		buff[index + 3] = rgba[3];
		return this;
	}
	setMid(x, y, mid) {
		//if (x < 0 || x >= this._width || y < 0 || y >= this._height || rgb.length !== 4)
		//	return this;
		let index = (y * this._width + x) * 4;
		let buff = this._uint8Data;
		buff[index]     = mid;
		buff[index + 1] = mid;
		buff[index + 2] = mid;
		return this;
	}
	getInnerUint8ClampedArray() {
		return this._uint8Data;
	}
	empty() {
		return this._uint8Data === null || this._width === 0 || this._height === 0;
	}
}

class TypedArrayWrapper {
	constructor(typedConstructor) {
		if (!typedConstructor)
			throw new Error("TypedArrayWrapper::constructor error!");
		
		this._width  = 0;
		this._height = 0;
		this._data   = null;
		this._typedConstructor = typedConstructor;
	}
	setBufferDefault(width, height) {
		this.clear();
		let length = width * height;
		if (width <= 0 || height <= 0 || length > Number.MAX_SAFE_INTEGER)
			return false;
		
		this._width  = width;
		this._height = height;
		this._data   = new (this._typedConstructor)(length);
		return true;
	}
	setBufferFromTypedWrapper(wrapper) {
		this.clear();
		if (wrapper.empty())
			return false;
		
		this._width  = wrapper.width();
		this._height = wrapper.height();
		this._data   = new (this._typedConstructor)(wrapper.getInnerTypedBuffer());
		return true;
	}
	
	empty() {
		return this._width === 0 || this._height === 0 || this._data === null;
	}
	clear() {
		this._width  = 0;
		this._height = 0;
		this._data   = null;
	}
	width() {
		return this._width;
	}
	height() {
		return this._height;
	}
	getInnerTypedBuffer() {
		return this._data;
	}
	
	getMid(x, y) {
		let index = y * this._width + x;
		return this._data[index];
	}
	setMid(x, y, val) {
		let index = y * this._width + x;
		this._data[index] = val;
		return this;
	}
}

class CannyLogic {
	static grayscale(wrapper) {
		const height = wrapper.height();
		const width  = wrapper.width();
		
		const res = new Uint8ClampedWrapper();
		res.setBufferFromUint8Wrapper(wrapper);
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x) {
				const rgb = wrapper.getRGB(x, y);
				const color = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
				res.setMid(x, y, color);
			}
		return res;
	}
	static smoothing(wrapper, diff, sigma) {
		const gaussKernel = CannyLogic._createGaussKernel(diff, sigma);
		const width  = wrapper.width();
		const height = wrapper.height();
		
		const res = new Uint8ClampedWrapper();
		res.setBufferFromUint8Wrapper(wrapper);
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x) {
				let sum = 0;
				let index = 0;
				for (let r = -diff; r <= diff; ++r)
					for (let c = -diff; c <= diff; ++c) {
						sum += gaussKernel[index] * CannyLogic._getPixel(wrapper, width, height, x + c, y + r);
						++index;
					}
				res.setMid(x, y, sum);
			}
		return res;
	}
	static gradientLength(wrapper) {
		const width  = wrapper.width();
		const height = wrapper.height();
		
		const gradLen     = new TypedArrayWrapper(Float64Array);
		const angleApprox = new TypedArrayWrapper(Uint8Array);
		const resWrapper  = new Uint8ClampedWrapper();
		
		gradLen.setBufferDefault(width, height);
		angleApprox.setBufferDefault(width, height);
		resWrapper.setBufferFromUint8Wrapper(wrapper);
		
		const PI = Math.PI;
		const angleIntervals = [PI / 8, 3 * PI / 8, 5 * PI / 8, 7 * PI / 8];
		
		const {kernelX, kernelY} = CannyLogic._getSobelKernel();
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x) {
				let gx = 0;
				let gy = 0;
				let index = 0;
				for (let i = -1; i <= 1; ++i)
					for (let j = -1; j <= 1; ++j) {
						const pixel = CannyLogic._getPixel(wrapper, width, height, x+j, y+i);
						gx += kernelX[index] * pixel;
						gy += kernelY[index] * pixel;
						++index;
					}
				
				const gradLenVal = Math.sqrt(gx * gx + gy * gy);
				gradLen.setMid(x, y, gradLenVal);
				resWrapper.setMid(x, y, gradLenVal);
				
				let angle = 0;
				if (gx !== 0 || gy !== 0)
					angle = Math.atan2(gy, gx);
				if (angle < 0)
					angle += PI;
				
				let dir = 0;
				for (let i = 0; i < angleIntervals.length; ++i)
					if (angle <= angleIntervals[i]) {
						dir = i;
						break;
					}
				angleApprox.setMid(x, y, dir);
			}
		
		return {gradLen, angleApprox, wrapper: resWrapper};
	}
	static thresholdSuppression(gradLen, angleApprox) {
		const width  = gradLen.width();
		const height = gradLen.height();
		
		const supprGradLen = new TypedArrayWrapper(Float64Array);
		const wrapper      = new Uint8ClampedWrapper();
		
		supprGradLen.setBufferFromTypedWrapper(gradLen);
		wrapper.setBufferDefault(width, height);
		
		const colDiffPrev = [-1, -1,  0,  1];
		const colDiffNext = [ 1,  1,  0, -1];
		const rowDiffPrev = [ 0, -1, -1, -1];
		const rowDiffNext = [ 0,  1,  1,  1];
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x) {
				const gradVal = gradLen.getMid(x, y);
				const dir     = angleApprox.getMid(x, y);
				
				const prevGrad = CannyLogic._getPixel(
					gradLen, width, height, x + colDiffPrev[dir], y + rowDiffPrev[dir]
				);
				const nextGrad = CannyLogic._getPixel(
					gradLen, width, height, x + colDiffNext[dir], y + rowDiffNext[dir]
				);
				
				wrapper.setMid(x, y, gradVal);
				if (gradVal < prevGrad || gradVal < nextGrad) {
					supprGradLen.setMid(x, y, 0);
					wrapper.setMid(x, y, 0);
				} else if (gradVal === prevGrad) {
					supprGradLen.setMid(x, y, 0);
					wrapper.setMid(x, y, 0);
				}
			}
		
		return {supprGradLen, wrapper};
	}
	static doubleThresholdFilter(supprGradLen, gradientThreshold1, gradientThreshold2) {
		const width  = supprGradLen.width();
		const height = supprGradLen.height();
		
		const wrapper = new Uint8ClampedWrapper();
		wrapper.setBufferDefault(width, height);
		
		if (gradientThreshold2 < gradientThreshold1) {
			let buff = gradientThreshold1;
			gradientThreshold1 = gradientThreshold2;
			gradientThreshold2 = buff;
		}
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x) {
				let grad = supprGradLen.getMid(x, y);
				let newGrad = 255;
				if (grad <= gradientThreshold1)
					newGrad = 0;
				else if (grad <= gradientThreshold2)
					newGrad = 127;
				wrapper.setMid(x, y, newGrad);
			}
		
		return wrapper;
	}
	static trackEdge(wrapper) {
		let width  = wrapper.width();
		let height = wrapper.height();
		
		let wrapperRes = new Uint8ClampedWrapper();
		wrapperRes.setBufferFromUint8Wrapper(wrapper);
		
		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width; ++x)
				if (wrapperRes.getMid(x, y) === 127) {
					let flagSave = false;
					let index = y * width + x;
					let buffAll = [index];
					let buffCurr = [index];
					wrapperRes.setMid(x, y, 0);
					
					while(buffCurr.length > 0) {
						let buffNext = [];
						for (let index of buffCurr) {
							let restY = Math.floor(index / width);
							let restX = index - restY * width;
							for (let i = restY - 1; i <= restY + 1; ++i)
								for (let j = restX - 1; j <= restX + 1; ++j)
									if (CannyLogic._isCorrectIndex(width, height, j, i)) {
										let grad = wrapperRes.getMid(j, i);
										if (grad === 255) {
											flagSave = true;
										} else if (grad === 127) {
											wrapperRes.setMid(j, i, 0);
											let index = i * width + j;
											buffAll.push(index);
											buffNext.push(index);
										}
									}
						}
						buffCurr = buffNext;
					}
					
					if (flagSave)
						for (let index of buffAll) {
							let restY = Math.floor(index / width);
							let restX = index - restY * width;
							wrapperRes.setMid(restX, restY, 255);
						}
				}
		
		return wrapperRes;
	}
	
	static _createGaussKernel(diff, sigma) {
		const coef1 =  1.0 / (2.0 * Math.PI * sigma * sigma);
		const coef2 = -1.0 / (2.0 * sigma * sigma);
		
		let sum = 0;
		let res = [];
		for (let y = -diff; y <= diff; ++y)
			for (let x = -diff; x <= diff; ++x) {
				let val = coef1 * Math.exp(coef2 * (x * x + y * y));
				res.push( val );
				sum += val;
			}
		for (let i = 0; i < res.length; ++i) 
			res[i] = res[i] / sum;
		return res;
	}
	static _getPixel(wrapper, width, height, x, y) {
		if (x < 0)
			x = 0;
		else if (x >= width)
			x = width - 1;
		if (y < 0)
			y = 0;
		else if (y >= height)
			y = height - 1;
		return wrapper.getMid(x, y);
	}
	static _getSobelKernel() {
		const kernelX = [
			-1, 0, 1,
			-2, 0, 2,
			-1, 0, 1,
		];
		const kernelY = [
			-1, -2, -1,
			 0,  0,  0,
			 1,  2,  1,
		];
		return {kernelX, kernelY};
	}
	static _isCorrectIndex(width, height, x, y) {
		if (x < 0 || y < 0 || x >= width || y >= height)
			return false;
		return true;
	}
}

function mainWorker() {
	let originalWrapper  = null;
	let grayscaleWrapper = null;
	let smoothedWrapper  = null;
	
	let gradLen      = null;
	let angleApprox  = null;
	
	let supprGradLen = null;
	
	let doubleFilteredWrapper = null;
	
	function messageHandler(message) {
		let {
			ID,
			stage,
			moveObject,
			diff,
			sigma,
			gradientThreshold1,
			gradientThreshold2,
		} = message.data;
		
		let wrapper = new Uint8ClampedWrapper();
		let tmpObj = null;
		
		switch (stage) {
			case 2:
				if (!moveObject)
					throw new Error("mainWorker::messageHandler error!");
				
				originalWrapper = new Uint8ClampedWrapper();
				originalWrapper.setBufferFromMoveObject(moveObject);
				moveObject = null;
				
				grayscaleWrapper = CannyLogic.grayscale(originalWrapper);
				wrapper.setBufferFromUint8Wrapper(grayscaleWrapper);
				break;
			case 3:
				smoothedWrapper = CannyLogic.smoothing(grayscaleWrapper, diff, sigma);
				wrapper.setBufferFromUint8Wrapper(smoothedWrapper);
				break;
			case 4:
				tmpObj = CannyLogic.gradientLength(smoothedWrapper);
				
				gradLen     = tmpObj.gradLen;
				angleApprox = tmpObj.angleApprox;
				wrapper     = tmpObj.wrapper;
				break;
			case 5:
				tmpObj = CannyLogic.thresholdSuppression(gradLen, angleApprox);
				
				supprGradLen = tmpObj.supprGradLen;
				wrapper      = tmpObj.wrapper;
				break;
			case 6:
				doubleFilteredWrapper = CannyLogic.doubleThresholdFilter(
					supprGradLen,
					gradientThreshold1,
					gradientThreshold2
				);
				wrapper.setBufferFromUint8Wrapper(doubleFilteredWrapper);
				break;
			case 7:
				wrapper = CannyLogic.trackEdge(doubleFilteredWrapper);
				break;
		}
		
		let res = {
			ID:         ID,
			stage:      stage,
			moveObject: wrapper.move(),
		};
		wrapper = null;
		self.postMessage(res, [res.moveObject._buffer]);
	}
	
	self.addEventListener("message", messageHandler);
}

mainWorker();




























