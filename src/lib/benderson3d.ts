import { KhronosTextureContainer2 } from '@babylonjs/core/Misc/khronosTextureContainer2';
import { MeshoptCompression } from '@babylonjs/core/Meshes/Compression/meshoptCompression';

import start from '../core';
function init() {
	const attrib = (name: string) => document.currentScript?.getAttribute(name) || '';
	const container = document.querySelector(attrib('data-container')) as HTMLElement;
	const canvas = document.querySelector(attrib('data-canvas')) as HTMLCanvasElement;
	const fps = document.querySelector(attrib('data-fps'));
	const model = attrib('data-model');
	const resourcesPath = new URL(attrib('data-resources'), document.location.href);

	KhronosTextureContainer2.URLConfig.jsDecoderModule = new URL(
		'babylon.ktx2Decoder.js',
		resourcesPath
	).href;
	KhronosTextureContainer2.URLConfig.jsMSCTranscoder = new URL(
		'msc_basis_transcoder.js',
		resourcesPath
	).href;
	KhronosTextureContainer2.URLConfig.wasmMSCTranscoder = new URL(
		'msc_basis_transcoder.wasm',
		resourcesPath
	).href;
	MeshoptCompression.Configuration.decoder.url = new URL('meshopt_decoder.js', resourcesPath).href;
	start(model, container, canvas, fps);
}
let loaded = false;
function onLoad() {
	if (!loaded && document.readyState !== 'loading') {
		loaded = true;
		init();
	}
}
onLoad();
if (!loaded) document.addEventListener('readystatechange', onLoad);
