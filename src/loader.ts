import start from './core';
import type { HostMessage, WorkerMessage } from './core';

type PostMessage = (msg: WorkerMessage) => void;

function isAtLeastIos(v: number) {
	let iOSVersion = '';
	const match = navigator.userAgent.match(/iPhone OS ([0-9_]*)/);
	if (match && match[1]) {
		iOSVersion = match[1].replace(/_/g, '.');
	}

	if (iOSVersion) {
		try {
			const majorVersion = parseInt(iOSVersion.split('.').shift() || '0', 10);
			return majorVersion >= v;
		} catch (e) {
			return false;
		}
	} else {
		return true;
	}
}

export default function init(
	workerConstructor: (() => Worker) | null,
	urls: string[],
	model: string,
	environment: string,
	animation: boolean,
	container: HTMLElement,
	canvas: HTMLCanvasElement,
	fps?: Element | null
) {
	const useWorker =
		/* false &&  */ isAtLeastIos(17) &&
		workerConstructor &&
		'OffscreenCanvas' in window &&
		'transferControlToOffscreen' in canvas;
	console.log(`${useWorker ? '' : 'not '}using worker`);
	let port;
	let channel;
	const destroyFuncs: (() => void | undefined)[] = [];
	if (useWorker) {
		const worker = workerConstructor();
		console.log(worker);
		port = worker;
		destroyFuncs.push(() => worker.terminate());
	} else {
		channel = new MessageChannel();
		port = channel.port2;
	}
	port.onmessage = ({ data }: { data: HostMessage }) => {
		if (data.type === 'fps') {
			if (fps) fps.innerHTML = data.fps.toFixed() + ' fps';
		} else if (data.type === 'loaded') {
			console.log('loaded!');
			container.classList.add('loaded');
			resize();
			if (!document.hasFocus()) {
				postMessage({ type: 'blur' });
			}
			destroyFuncs.push(setupView(animation, container, canvas, postMessage));
		} else if (data.type === 'unloaded') {
			container.classList.remove('loaded');
			destroy();
		} else if (data.type === 'subscribe') {
			const name = data.name;
			function evt(e: any) {
				if (name === 'contextmenu' || name === 'wheel') {
					e.preventDefault();
				}
				const mouseEventCloned: Record<string, any> = {};

				const mouseEventFields = [
					'altKey',
					'button',
					'buttons',
					'clientX',
					'clientY',
					'ctrlKey',
					'metaKey',
					'movementX',
					'movementY',
					'pointerId',
					'pointerType',
					'screenX',
					'screenY',
					'shiftKey',
					'x',
					'y',
					'deltaX',
					'deltaY',
					'wheelDelta',
					'deltaZ'
				];
				for (const field of mouseEventFields) {
					mouseEventCloned[field] = e[field];
				}
				if (name === 'pointerout') {
					mouseEventCloned.outOfCanvas = document.elementFromPoint(e.clientX, e.clientY) !== canvas;
				}
				postMessage({ type: 'event', name, details: mouseEventCloned });
			}
			canvas.addEventListener(name, evt, {
				passive: false,
				capture: data.useCapture
			});
			destroyFuncs.push(() => canvas.removeEventListener(name, evt));
		}
	};
	const postMessage: PostMessage = port.postMessage.bind(port);
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	if (useWorker) {
		const off = canvas.transferControlToOffscreen();
		port.postMessage([urls, model, environment, animation, off, window.devicePixelRatio], [off]);
		resize();
		const blur = () => postMessage({ type: 'blur' });
		const focus = () => postMessage({ type: 'focus' });
		window.addEventListener('blur', blur);
		window.addEventListener('focus', focus);
		destroyFuncs.push(() => window.removeEventListener('blur', blur));
		destroyFuncs.push(() => window.removeEventListener('focus', focus));
	} else {
		start(channel!.port1, urls, model, environment, animation, canvas);
	}
	function resize() {
		postMessage({
			type: 'resize',
			rect: canvas.getBoundingClientRect(),
			devicePixelRatio: window.devicePixelRatio
		});
	}
	window.addEventListener('resize', resize);
	let destroy = () => {
		window.removeEventListener('resize', resize);
		for (const f of destroyFuncs) {
			f?.();
		}
		destroy = () => {};
	};
	return destroy;
}

function setupView(
	animation: boolean,
	container: HTMLElement,
	canvas: HTMLCanvasElement,
	postMessage: PostMessage
) {
	let onScreen: Pick<IntersectionObserverEntry, 'target' | 'boundingClientRect'>[] = [];
	const observer = new IntersectionObserver(
		(obs) => {
			onScreen = onScreen.filter(
				(e) => !obs.some((o) => o.target === e.target && !o.isIntersecting)
			);
			for (let i = 0; i < onScreen.length; i++) {
				onScreen[i] = {
					target: onScreen[i].target,
					boundingClientRect: onScreen[i].target.getBoundingClientRect()
				};
			}
			onScreen.push(...obs.filter((o) => o.isIntersecting));
			onScreen.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
			ev();
		},
		{ threshold: [0] }
	);
	const elements: Element[] = [];
	for (const ele of container.getElementsByClassName('row')) {
		elements.push(ele);
		observer.observe(ele);
	}

	const bigMode = window.matchMedia('(min-width: 928px)');
	let active: Element | undefined = undefined;
	function ev() {
		if (!onScreen.length) return;
		let middle = window.visualViewport!.height / 2;
		if (!bigMode.matches) middle = 0;
		const heights = onScreen.map(({ target }) => target.getBoundingClientRect().top);
		let selected = 0;
		for (let i = 1; i < heights.length; i++) {
			if (heights[i] < middle) selected = i;
		}
		if (animation || onScreen[selected].target !== active) {
			if (onScreen[selected].target !== active) {
				active?.classList.remove('active');
				onScreen[selected].target.classList.add('active');
			}
			active = onScreen[selected].target;
			// console.log('switch to', active);
			if (!animation) active.nextElementSibling?.appendChild(canvas.parentElement!);
			const index = elements.indexOf(active);

			postMessage({
				type: 'changeFocus',
				attributes: Object.fromEntries(
					[...active.attributes].map((attr) => [attr.name, attr.value])
				),
				nextAttributes: Object.fromEntries(
					[...(elements[index + 1]?.attributes || [])].map((attr) => [attr.name, attr.value])
				),
				prevAttributes: Object.fromEntries(
					[...(elements[index - 1]?.attributes || [])].map((attr) => [attr.name, attr.value])
				),
				progress: 0,
				bigMode: bigMode.matches
			});
		}
	}

	window.addEventListener('scroll', ev);
	return () => {
		window.removeEventListener('scroll', ev);
		observer.disconnect();
	};
}
