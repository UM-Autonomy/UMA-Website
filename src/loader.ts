import start from './core';

export default function init(
	model: string,
	container_: HTMLElement,
	canvas_: HTMLCanvasElement,
	fps_?: Element | null
) {
	const worker = new Worker(new URL('./core.ts', import.meta.url), {
		type: 'module'
	});
	console.log(worker);
}
