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
import { Animation, CubicEase, EasingFunction } from '@babylonjs/core/Animations';
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
import './fixUrls';

import '@babylonjs/loaders/glTF/2.0';
import { SkyMaterial } from '@babylonjs/materials/sky';
import { MeshBuilder } from '@babylonjs/core/Meshes';
import { NodeMaterial } from '@babylonjs/core/Materials';

let canvas: HTMLCanvasElement;
let fps: HTMLElement | undefined;
let container: HTMLElement;

function startRenderLoop(engine: Engine, canvas: HTMLCanvasElement) {
	engine.runRenderLoop(function () {
		if (sceneToRender && sceneToRender.activeCamera) {
			if (fps) fps.innerHTML = engine.getFps().toFixed() + ' fps';
			sceneToRender.render();
		}
	});
}
function setupView(scene: Scene) {
	document.querySelector('.outer')?.classList.add('loaded');

	let onScreen: Pick<IntersectionObserverEntry, 'target' | 'boundingClientRect'>[] = [];
	const observer = new IntersectionObserver(
		(obs) => {
			for (let i = 0; i < onScreen.length; i++) {
				onScreen[i] = {
					target: onScreen[i].target,
					boundingClientRect: onScreen[i].target.getBoundingClientRect()
				};
			}
			onScreen.push(...obs.filter((o) => o.isIntersecting));
			onScreen = onScreen.filter(
				(e) => !obs.some((o) => o.target === e.target && !o.isIntersecting)
			);
			onScreen.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
			ev();
		},
		{ threshold: [0] }
	);
	for (const ele of container.getElementsByClassName('row')) {
		observer.observe(ele);
	}

	const bigMode = window.matchMedia('(min-width: 928px)');
	let active = container.querySelector('#Introduction')!;
	function ev() {
		if (!onScreen.length) return;
		let middle = window.visualViewport!.height / 2;
		if (!bigMode.matches) middle = 0;
		const heights = onScreen.map(({ target }) => target.getBoundingClientRect().top);
		let selected = 0;
		for (let i = 1; i < heights.length; i++) {
			if (heights[i] < middle) selected = i;
		}
		if (onScreen[selected].target !== active) {
			changeFocus(active, onScreen[selected].target);
			active = onScreen[selected].target;
		}
	}

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
	function changeFocus(old: Element, active: Element) {
		active.nextElementSibling?.appendChild(canvas.parentElement!);
		console.log('switch to', active);
		const camera = scene.activeCamera as ArcRotateCamera;
		let animations: Animation[] = [];
		if (active.id === 'Introduction') {
			animations.push(createMoveAnim(camera, new Vector3(266, 3, -510)));
			animations.push(createRadAnim(camera, 200));
			animations.push(createBetaAnim(camera, 0.966));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.3;
		} else if (active.id === 'Static') {
			animations.push(createMoveAnim(camera, new Vector3(302, 0, -385)));
			animations.push(createRadAnim(camera, 30));
			animations.push(createBetaAnim(camera, 1.2));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.2;
		} else if (active.id === 'Navigation') {
			animations.push(createMoveAnim(camera, new Vector3(307.7, 0, -375.6)));
			animations.push(createRadAnim(camera, 15));
			animations.push(createAlphaAnim(camera, Math.PI));
			animations.push(createBetaAnim(camera, 0.938));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		} else if (active.id === 'Obstacle') {
			animations.push(createMoveAnim(camera, new Vector3(319.3, 0, -381.9)));
			animations.push(createRadAnim(camera, 25));
			animations.push(createBetaAnim(camera, 0.938));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		} else if (active.id === 'Speed') {
			animations.push(createMoveAnim(camera, new Vector3(311.08, 0, -387.039)));
			animations.push(createRadAnim(camera, 15));
			animations.push(createBetaAnim(camera, 0.938));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		} else if (active.id === 'Docking') {
			animations.push(createMoveAnim(camera, new Vector3(313.619, 0, -398.136)));
			animations.push(createRadAnim(camera, 12));
			animations.push(createBetaAnim(camera, 0.938));
			animations.push(createAlphaAnim(camera, Math.PI * 0.5));
			camera.autoRotationBehavior!.idleRotationSpeed = 0;
		} else if (active.id === 'Skeeball') {
			animations.push(createMoveAnim(camera, new Vector3(304.417, 0, -385.015)));
			animations.push(createRadAnim(camera, 12));
			animations.push(createBetaAnim(camera, 0.938));
			animations.push(createAlphaAnim(camera, Math.PI));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		} else if (active.id === 'Waterblast') {
			animations.push(createMoveAnim(camera, new Vector3(303.513, 0, -390.266)));
			animations.push(createRadAnim(camera, 12));
			animations.push(createBetaAnim(camera, 0.938));
			animations.push(createAlphaAnim(camera, Math.PI));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		} else if (active.id === 'Cleanup') {
			animations.push(createMoveAnim(camera, new Vector3(301.393, 0, -395.65)));
			animations.push(createRadAnim(camera, 12));
			animations.push(createBetaAnim(camera, 0.938));
			camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
		}
		const ease = new CubicEase();
		ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		for (const anim of animations) {
			anim.setEasingFunction(ease);
		}

		scene.stopAnimation(camera);
		scene.beginDirectAnimation(camera, animations, 0, 100, false, bigMode.matches ? 1 : Infinity);
	}

	window.addEventListener('scroll', ev);
	destroyFuncs.push(() => {
		window.removeEventListener('scroll', ev);
		observer.disconnect();
	});
}
const destroyFuncs: (() => void)[] = [];
let engine: Engine | null = null;
let scene: Scene | null = null;
let sceneToRender: Scene | null = null;
const createDefaultEngine = function () {
	return new Engine(canvas, false, {
		disableWebGL2Support: false,
		adaptToDeviceRatio: true,
		alpha: false,
		doNotHandleContextLost: true
	});
};
const delayCreateScene = function (engine: Engine) {
	// Create a scene.
	const scene = new Scene(engine);
	// const reflector = new BABYLON.Reflector(scene, "67.194.202.239", 1234);
	scene.performancePriority = ScenePerformancePriority.Intermediate;

	// Create a default skybox with an environment.
	// const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("environment.dds", scene);
	// scene.environmentTexture = hdrTexture;
	// const currentSkybox = scene.createDefaultSkybox(hdrTexture, true);
	// const currentSkybox = scene.createDefaultSkybox(rp.cubeTexture, true);
	// window.currentSkybox = currentSkybox;
	// currentSkybox.material = skyMaterial
	// Append glTF model to scene.
	SceneLoader.ShowLoadingScreen = false;
	SceneLoader.Append('./', 'model2.glb', scene, (s) => {
		try {
			onSuccess(s);
		} catch (e) {
			console.error(e);
		}
	});
	function onSuccess(scene: Scene) {
		// Create a default arc rotate camera and light.
		// scene.createDefaultCamera(true, true, true);
		engine.setSize(200, 100);
		const camera = new ArcRotateCamera('Camera', -32, 0.966, 200, new Vector3(266, 3, -510), scene);
		camera.attachControl();
		camera.useAutoRotationBehavior = true;
		camera.autoRotationBehavior!.idleRotationSpeed = 0.3;
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

		scene.clearCachedVertexData();
		scene.cleanCachedTextureBuffer();

		setupView(scene);
	}

	return scene;
};
async function initFunction() {
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
	canvas.addEventListener('webglcontextlost', () => {
		engine?.dispose();
		document.querySelector('.outer')?.classList.remove('loaded');
	});
	startRenderLoop(engine, canvas);
	scene = delayCreateScene(engine);
	sceneToRender = scene;
	(window as unknown as any).scene = scene;
}

function resize() {
	engine?.resize();
}

export default function (container_: HTMLElement, canvas_: HTMLCanvasElement, fps_?: HTMLElement) {
	container = container_;
	canvas = canvas_;
	fps = fps_;
	initFunction();
	window.addEventListener('resize', resize);
	return () => {
		window.removeEventListener('resize', resize);
		for (const f of destroyFuncs) {
			f();
		}
	};
}
