import start from '../loader';
function init() {
	const attrib = (name: string) => document.currentScript?.getAttribute(name) || '';
	const container = document.querySelector(attrib('data-container')) as HTMLElement;
	const canvas = document.querySelector(attrib('data-canvas')) as HTMLCanvasElement;
	const fps = document.querySelector(attrib('data-fps'));
	const model = attrib('data-model');
	const environment = attrib('data-environment');
	const animation = !!attrib('data-animation');
	const resourcesPath = new URL(attrib('data-resources'), document.location.href);

	const urls = [
		new URL('babylon.ktx2Decoder.js', resourcesPath).href,
		new URL('msc_basis_transcoder.js', resourcesPath).href,
		new URL('msc_basis_transcoder.wasm', resourcesPath).href,
		new URL('meshopt_decoder.js', resourcesPath).href
	];
	let workerConstructor = null;
	if (document.currentScript) {
		workerConstructor = () =>
			new Worker(new URL((document.currentScript! as HTMLScriptElement).src));
	}
	start(workerConstructor, urls, model, environment, animation, container, canvas, fps);
}
let loaded = false;
function onLoad() {
	if (!loaded && document.readyState !== 'loading') {
		loaded = true;
		init();
	}
}

const isWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
if (!isWorker) {
	onLoad();
	if (!loaded) document.addEventListener('readystatechange', onLoad);
}
