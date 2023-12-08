/// <reference lib="webworker" />

// gltfpack -i model.glb -o model2.glb -cc -tc -mi -vp 16 -vpf
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene, ScenePerformancePriority } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { ReflectionProbe } from '@babylonjs/core/Probes/reflectionProbe';
import { CascadedShadowGenerator } from '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator';
import type { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import '@babylonjs/core/Actions';
import {
	Animation,
	CubicEase,
	EasingFunction,
	Animatable,
	SineEase
} from '@babylonjs/core/Animations';
import { Tools } from '@babylonjs/core/Misc/tools';
import '@babylonjs/core/BakedVertexAnimation';
import '@babylonjs/core/Behaviors';
import '@babylonjs/core/Buffers';
import '@babylonjs/core/Compat';
import '@babylonjs/core/Compute';
import '@babylonjs/core/Culling';
import '@babylonjs/core/Debug';
import '@babylonjs/core/DeviceInput';
import '@babylonjs/core/Engines';
import '@babylonjs/core/Events';
import '@babylonjs/core/Helpers';
import '@babylonjs/core/Layers';
import '@babylonjs/core/Lights';
import '@babylonjs/core/Materials';
import '@babylonjs/core/Meshes';
import '@babylonjs/core/Misc';
import '@babylonjs/core/Rendering';
import '@babylonjs/core/States';

import '@babylonjs/loaders/glTF/2.0';
import { SkyMaterial } from '@babylonjs/materials/sky';
import { MeshBuilder } from '@babylonjs/core/Meshes';
import { CubeTexture, NodeMaterial } from '@babylonjs/core/Materials';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HighlightLayer } from '@babylonjs/core/Layers';

const isWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

let canvas: HTMLCanvasElement | OffscreenCanvas;
let sendMessage: (msg: HostMessage) => void;
let animation = false;

export interface FpsMsg {
	type: 'fps';
	fps: number;
}
export interface SubscribeMsg {
	type: 'subscribe';
	name: string;
	useCapture?: boolean;
}
export type HostMessage = FpsMsg | SubscribeMsg | { type: 'loaded' } | { type: 'unloaded' };
export interface ResizeMsg {
	type: 'resize';
	rect: DOMRect;
	devicePixelRatio: number;
}
export interface ChangeFocusMsg {
	type: 'changeFocus';
	attributes: Record<string, string>;
	nextAttributes?: Record<string, string>;
	prevAttributes?: Record<string, string>;
	progress: number;
	bigMode: boolean;
}
export interface EventMsg {
	type: 'event';
	name: string;
	details: any;
}
export type WorkerMessage =
	| ResizeMsg
	| ChangeFocusMsg
	| EventMsg
	| { type: 'blur' }
	| { type: 'focus' };

function startRenderLoop(engine: Engine) {
	engine.runRenderLoop(function () {
		if (sceneToRender && sceneToRender.activeCamera) {
			sendMessage({ type: 'fps', fps: engine.getFps() });
			sceneToRender.render();
		}
	});
}
let changeFocus = (m: ChangeFocusMsg) => {};
function setupView(scene: Scene) {
	console.log('setupView');
	scene.executeWhenReady(() => {
		sendMessage({ type: 'loaded' });
	});
	if (animation) {
		setupFollowBakedAnimation();
	} else {
		setupArcCameraAnimations();
	}
}
function setupFollowBakedAnimation() {
	let lastAnim: Animatable | null = null;
	let lastTime = 0;
	const group = scene!.animationGroups[0];
	const animatableObject = {
		set a(v: number) {
			console.log(v);
			group.goToFrame(v);
		}
	};
	const c = Color3.FromHexString('#FFCB05');
	const hl = new HighlightLayer('hl1', scene!, {
		blurHorizontalSize: 1.5,
		blurVerticalSize: 1.5,
		isStroke: true
	});
	self.hl = hl;
	hl.innerGlow = false;
	changeFocus = (msg: ChangeFocusMsg) => {
		hl.removeAllMeshes();
		(msg.attributes['data-highlight']?.split(',') || [])
			.flatMap((name) => {
				const node = scene!.getNodeByName(name);
				if (!node) return [];
				return [node, ...node.getChildMeshes()];
			})
			.forEach((m) => m instanceof Mesh && hl.addMesh(m, c));
		const sec = +msg.attributes['data-seconds'];
		const end = sec * 60;
		let start = 0;
		lastTime = Math.max(scene!._animationTimeLast, lastTime);
		if (lastAnim) {
			const target =
				Math.sign(lastAnim.toFrame - lastAnim.fromFrame) * 100 * (Date.now() - lastTime) * 0.001 +
					lastAnim.masterFrame || lastAnim.fromFrame;
			lastAnim.goToFrame(target);
			if (lastAnim.getAnimations()[0].currentValue) {
				start = lastAnim.getAnimations()[0].currentValue;
			} else {
				start = lastAnim.masterFrame || lastAnim.fromFrame;
			}
		}
		lastTime = Date.now();
		console.log(start, 'to', end);
		if (start === end) return;
		const moveAnim = new Animation('bruh', 'a', 100, Animation.ANIMATIONTYPE_FLOAT);
		const keys = [
			{ frame: start, value: start },
			{ frame: end, value: end }
		];
		keys.sort((a, b) => a.frame - b.frame);
		moveAnim.setKeys(keys);
		const ease = new SineEase();
		ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
		moveAnim.setEasingFunction(ease);
		scene!.stopAnimation(animatableObject);
		lastAnim = scene!.beginDirectAnimation(animatableObject, [moveAnim], start, end, false, 1, () =>
			console.log(lastAnim)
		);
	};
}
function setupArcCameraAnimations() {
	function quickAnim<T>(prop: string, type: number, initial: T, final: T) {
		const moveAnim = new Animation(prop, prop, 100, type);
		moveAnim.setKeys([
			{ frame: 0, value: initial },
			{ frame: 100, value: final }
		]);
		return moveAnim;
	}

	function createMoveAnim(camera: ArcRotateCamera, value: Vector3) {
		return quickAnim('_target', Animation.ANIMATIONTYPE_VECTOR3, camera._currentTarget, value);
	}

	function createRadAnim(camera: ArcRotateCamera, value: number) {
		return quickAnim('radius', Animation.ANIMATIONTYPE_FLOAT, camera.radius, value);
	}

	function createAlphaAnim(camera: ArcRotateCamera, value: number) {
		let realAngle = ((camera.alpha % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
		if (realAngle > Math.PI) realAngle -= Math.PI * 2;
		return quickAnim(
			'alpha',
			Animation.ANIMATIONTYPE_FLOAT,
			camera.alpha,
			value - realAngle + camera.alpha
		);
	}

	function createBetaAnim(camera: ArcRotateCamera, value: number) {
		return quickAnim('beta', Animation.ANIMATIONTYPE_FLOAT, camera.beta, value);
	}
	let firstTime = true;
	changeFocus = (msg: ChangeFocusMsg) => {
		const camera = scene.activeCamera as ArcRotateCamera;
		let animations: Animation[] = [];
		let val;
		if ((val = msg.attributes['data-location'])) {
			animations.push(createMoveAnim(camera, new Vector3(...JSON.parse(`[${val}]`))));
		}
		if ((val = msg.attributes['data-radius'])) {
			animations.push(createRadAnim(camera, Number.parseFloat(val)));
		}
		if ((val = msg.attributes['data-alpha'])) {
			animations.push(createAlphaAnim(camera, Number.parseFloat(val)));
		}
		if ((val = msg.attributes['data-beta'])) {
			animations.push(createBetaAnim(camera, Number.parseFloat(val)));
		}
		if ((val = msg.attributes['data-speed'])) {
			camera.autoRotationBehavior!.idleRotationSpeed = Number.parseFloat(val);
		}
		const ease = new CubicEase();
		ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		for (const anim of animations) {
			anim.setEasingFunction(ease);
		}

		scene.stopAnimation(camera);
		scene.beginDirectAnimation(
			camera,
			animations,
			0,
			100,
			false,
			msg.bigMode && !firstTime ? 1 : Infinity
		);
		firstTime = false;
	};
}
const destroyFuncs: (() => void)[] = [];
let engine: Engine | null = null;
let scene: Scene | null = null;
let sceneToRender: Scene | null = null;
let rect: Partial<DOMRect> = {
	x: 0,
	y: 0,
	bottom: 0,
	height: 0,
	left: 0,
	right: 0,
	top: 0,
	width: 0
};
let blurCb: (() => void)[] = [];
let focusCb: (() => void)[] = [];
const createDefaultEngine = function () {
	return new Engine(canvas, false, {
		disableWebGL2Support: false,
		adaptToDeviceRatio: true,
		doNotHandleContextLost: true,
		failIfMajorPerformanceCaveat: true,
		autoEnableWebVR: false,
		stencil: true
	});
};
const delayCreateScene = function (engine: Engine, model: string) {
	// Create a scene.
	const scene = new Scene(engine);
	// const reflector = new BABYLON.Reflector(scene, "67.194.202.239", 1234);
	// scene.performancePriority = ScenePerformancePriority.Intermediate;

	// Create a default skybox with an environment.
	// const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("environment.dds", scene);
	// scene.environmentTexture = hdrTexture;
	// const currentSkybox = scene.createDefaultSkybox(hdrTexture, true);
	// const currentSkybox = scene.createDefaultSkybox(rp.cubeTexture, true);
	// window.currentSkybox = currentSkybox;
	// currentSkybox.material = skyMaterial
	// Append glTF model to scene.
	SceneLoader.ShowLoadingScreen = false;
	SceneLoader.Append(model, undefined, scene, (s) => {
		try {
			onSuccess(s);
		} catch (e) {
			console.error(e);
		}
	});
	function onSuccess(scene: Scene) {
		if (!animation) {
			setupSystem();
		} else {
			scene.clearColor = Color4.FromHexString('#00274C');
			const hdrTexture = CubeTexture.CreateFromPrefilteredData('/textures/environment.env', scene);
			scene.environmentTexture = hdrTexture;
			scene.activeCamera = scene.cameras[0];
			scene.animationGroups[0].pause();
		}

		// scene.clearCachedVertexData();
		scene.cleanCachedTextureBuffer();

		setupView(scene);
	}
	function setupSystem() {
		engine.setSize(200, 100);
		const camera = new ArcRotateCamera('Camera', -32, 0.966, 200, new Vector3(266, 3, -510), scene);
		camera.attachControl();
		camera.useAutoRotationBehavior = true;
		camera.autoRotationBehavior!.idleRotationSpeed = 0;
		camera.upperBetaLimit = 1.5;
		camera.lowerRadiusLimit = 5;
		camera.upperRadiusLimit = 500;
		camera.panningAxis = new Vector3(1, 0, 1);

		// The default camera looks at the back of the asset.
		// Rotate the camera by 180 degrees to the front of the asset.
		// scene.activeCamera.alpha += Math.PI;
		// scene.activeCamera = scene.cameras[0]

		// scene.materials.forEach(m => m.freeze());
		// scene.meshes.forEach(m => m.freezeWorldMatrix());

		const light = scene.lights[0];
		light.intensity = 8;

		const csmShadowGenerator = new CascadedShadowGenerator(1024, light as DirectionalLight);
		for (const m of scene.meshes) {
			if (m.infiniteDistance) {
				return;
			}
			csmShadowGenerator.addShadowCaster(m);
			if (!m.isAnInstance) {
				m.receiveShadows = true;
			}
		}
		csmShadowGenerator.transparencyShadow = true;
		csmShadowGenerator.enableSoftTransparentShadow = true;
		csmShadowGenerator.autoCalcDepthBounds = true;
		csmShadowGenerator.bias = 0.0015;
		csmShadowGenerator.cascadeBlendPercentage = 0;

		const skyMaterial = new SkyMaterial('skyMaterial', scene);
		// skyMaterial.backFaceCulling = false;
		// skyMaterial.ignoreCameraMaxZ = true;
		skyMaterial.inclination = 0;
		skyMaterial.rayleigh = 0.8;
		skyMaterial.turbidity = 15;
		skyMaterial.luminance = 0.3;
		// window.skyMaterial = skyMaterial;

		scene.onAfterRenderObservable.add(() => {
			skyMaterial.useSunPosition = true; // Do not set sun position from azimuth and inclination
			skyMaterial.sunPosition = light.getAbsolutePosition();
			engine.resize();
		});
		const skybox = Mesh.CreateBox('skyBox', 2000, scene, false, Mesh.BACKSIDE);
		skybox.infiniteDistance = true;
		skybox.material = skyMaterial;

		const rp = new ReflectionProbe('ref', 512, scene);
		rp.refreshRate = 60;
		rp.renderList!.push(skybox);

		scene.customRenderTargets.push(rp.cubeTexture);

		scene.environmentTexture = rp.cubeTexture;

		NodeMaterial.ParseFromSnippetAsync('#N8UNHX#81', scene).then((node) => {
			const waterMat = scene.materials.find((mat) => mat.name === 'Water');
			const water = scene.meshes.find((m) => m.material === waterMat)!;
			water.visibility = 0;
			const bbox = water.getBoundingInfo().boundingBox;
			const scale = 1;

			const ground = MeshBuilder.CreateGround(
				'ground',
				{
					width: (bbox.extendSizeWorld.z * 2) / scale,
					height: (bbox.extendSizeWorld.x * 2) / scale
				},
				scene
			);
			ground.receiveShadows = true;
			ground.position = bbox.centerWorld;

			ground.scaling = new Vector3(scale, 1, scale);
			ground.material = node;
			node.getInputBlockByPredicate((b) => b.name === 'uvScale')!.value = 256;
			node.getInputBlockByPredicate((b) => b.name === 'TimeScale')!.value = 0.1;
			node.getInputBlockByPredicate((b) => b.name === 'bumpIntensity')!.value = 0.75;
			const color = node.getInputBlockByPredicate((b) => b.name === 'baseColor')!;

			color.value.r = 29 / 255;
			color.value.g = 51 / 255;
			color.value.b = 100 / 255;
		});
	}

	return scene;
};
async function initFunction(model: string) {
	const asyncEngineCreation = async function () {
		try {
			return createDefaultEngine();
		} catch (e) {
			console.log(
				'the available createEngine function failed. Creating the default engine instead'
			);
			return createDefaultEngine();
		}
	};

	engine = await asyncEngineCreation();
	if (!engine) throw 'engine should not be null.';
	destroyFuncs.push(() => engine?.dispose());
	engine.renderEvenInBackground = animation;
	canvas.addEventListener('webglcontextlost', () => {
		engine?.dispose();
		sendMessage({ type: 'unloaded' });
	});
	startRenderLoop(engine);
	scene = delayCreateScene(engine, model);
	sceneToRender = scene;
	let global;
	if (!isWorker) {
		global = window as unknown as any;
	} else {
		global = self as unknown as any;
	}
	global.scene = scene;
	global.Color3 = Color3;
	global.HighlightLayer = HighlightLayer;
}

let evtHandlers: Record<string, (e: any) => void> = {};

function handleMessage({ data }: { data: WorkerMessage }) {
	if (data.type === 'resize') {
		console.log('resize!');
		rect = data.rect;
		window.devicePixelRatio = data.devicePixelRatio;
		engine?.resize();
	} else if (data.type === 'changeFocus') {
		changeFocus(data);
	} else if (data.type === 'event') {
		data.details.preventDefault = () => {};
		evtHandlers[data.name]?.(data.details);
	} else if (data.type === 'blur') {
		for (const cb of blurCb) {
			cb();
		}
	} else if (data.type === 'focus') {
		for (const cb of focusCb) {
			cb();
		}
	}
}

export default function init(
	port: MessagePort | DedicatedWorkerGlobalScope,
	model: string,
	animation_: boolean,
	canvas_: HTMLCanvasElement | OffscreenCanvas
) {
	canvas = canvas_;
	animation = animation_;
	sendMessage = port.postMessage.bind(port);
	port.onmessage = handleMessage;
	initFunction(model);
}

if (isWorker) {
	try {
		new Function('import("")');
		Tools.LoadScript = (
			scriptUrl: string,
			onSuccess: () => void,
			onError?: (message?: string, exception?: any) => void
		) => {
			import(/* @vite-ignore */ scriptUrl).then(onSuccess).catch((e) => {
				console.error('Error loading script', e);
				onError?.(e.toString(), e);
			});
		};
	} catch (e) {
		// If we're not running in Module mode, no need to do anything
	}
	self.onmessage = (args) => {
		const model: string = args.data[0];
		const animation: boolean = args.data[1];
		const canvas: OffscreenCanvas = args.data[2];
		const realAddListener = canvas.addEventListener;
		self.document = {
			// @ts-ignore
			elementFromPoint(x, y) {
				return canvas;
			},
			addEventListener(name: string, handler: (e: Event) => any, useCapture?: boolean) {},
			// @ts-ignore
			createElement(name: string) {
				return { onwheel: {} };
			}
		};
		self.window = {
			// @ts-ignore
			addEventListener(name: string, handler: () => any, useCapture?: boolean) {
				if (name === 'blur') blurCb.push(handler);
				if (name === 'focus') focusCb.push(handler);
			},
			PointerEvent: {}
		};
		// @ts-ignore
		canvas.getBoundingClientRect = () => rect;
		// @ts-ignore
		canvas.style = {};
		// @ts-ignore
		canvas.focus = () => {};
		canvas.addEventListener = (name: string, handler: (e: Event) => any, useCapture?: boolean) => {
			if (name === 'webglcontextlost') {
				realAddListener(name, handler, useCapture);
			} else {
				evtHandlers[name] = handler;
				sendMessage({ type: 'subscribe', name, useCapture });
			}
		};
		init(self as DedicatedWorkerGlobalScope, model, animation, canvas);
	};
	console.log('core load WORKER');
}

/*
c=Color3.FromHexString('#FFCB05')
hl = new HighlightLayer("hl1", scene);
m=scene.getNodeByName('VN300_Rugged').getChildMeshes().forEach(m=>m.isAnInstance || hl.addMesh(m,c))
hl.innerGlow=false
hl.blurVerticalSize=hl.blurHorizontalSize=5
*/
