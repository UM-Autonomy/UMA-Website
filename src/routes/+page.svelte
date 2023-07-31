<script lang="ts">
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
	import '@babylonjs/core/Loading/loadingScreen';
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
	import '../fixUrls';

	import '@babylonjs/loaders/glTF/2.0';
	import { SkyMaterial } from '@babylonjs/materials/sky';
	import { onMount, onDestroy } from 'svelte';
	import { CreateTiledPlane, MeshBuilder } from '@babylonjs/core/Meshes';
	import { NodeMaterial } from '@babylonjs/core/Materials';

	let canvas: HTMLCanvasElement;
	let fps: HTMLElement;
	let container: HTMLElement;

	function startRenderLoop(engine: Engine, canvas: HTMLCanvasElement) {
		engine.runRenderLoop(function () {
			if (sceneToRender && sceneToRender.activeCamera) {
				fps.innerHTML = engine.getFps().toFixed() + ' fps';
				sceneToRender.render();
			}
		});
	}
	function setupView(scene: Scene) {
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
			return quickAnim('alpha', Animation.ANIMATIONTYPE_FLOAT, camera.alpha, value - realAngle + camera.alpha);
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
			} else if (active.id === 'Navigation') {
				animations.push(createMoveAnim(camera, new Vector3(307.7, 0, -375.6)));
				animations.push(createRadAnim(camera, 15));
				animations.push(createAlphaAnim(camera, Math.PI));
				animations.push(createBetaAnim(camera, 0.938));
				camera.autoRotationBehavior!.idleRotationSpeed = 0.1;
			} else if (active.id === 'Obstacle') {
				animations.push(createMoveAnim(camera, new Vector3(319.3, 0, -381.9)));
				animations.push(createRadAnim(camera, 15));
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
		onDestroy(() => {
			window.removeEventListener('scroll', ev);
			observer.disconnect();
		});
	}

	let engine: Engine | null = null;
	let scene: Scene | null = null;
	let sceneToRender: Scene | null = null;
	const createDefaultEngine = function () {
		return new Engine(canvas, false, {
			disableWebGL2Support: false,
			adaptToDeviceRatio: true
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
		SceneLoader.Append('./', 'model2.glb', scene, function (scene) {
			// Create a default arc rotate camera and light.
			// scene.createDefaultCamera(true, true, true);
			engine.setSize(200, 100);
			const camera = new ArcRotateCamera(
				'Camera',
				-32,
				0.966,
				200,
				new Vector3(266, 3, -510),
				scene
			);
			camera.attachControl();
			camera.useAutoRotationBehavior = true;
			camera.autoRotationBehavior!.idleRotationSpeed = 0.3;

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
		});

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
		startRenderLoop(engine, canvas);
		scene = delayCreateScene(engine);
		window.scene = scene;
	}

	onMount(() => {
		initFunction().then(() => {
			sceneToRender = scene;
		});
	});
	function resize() {
		engine?.resize();
	}
</script>

<svelte:window on:resize={resize} />
<div class="outer" bind:this={container}>
	<section id="Introduction" class="row">
		<div class="park-info">
			<h2>RoboBoat 2023: Ocean Exploration</h2>
			<h3>Nathan Benderson Park</h3>
			<p>Sarasota, Florida</p>
			<p>
				RoboBoat is an international competition where students design, build, and compete with
				self-driving robotic boats, in a series of tests aimed at challenging teams through a
				variety autonomous (self-driving) tasks. In 2023, we were joined by 18 other teams from 4
				continents. UM::Autonomy placed 6th place overall, and 3rd among American Universities.
			</p>
		</div>
		<h2>Competition Strategy</h2>
		<div class="my-4">
			<h3>Team Focus</h3>
			<p>
				For this competition season, our team decided to reuse the Flying Sloth hull from our 2017
				competition. This allowed for greater focus on testing and on learning skills that the team
				lost due to the graduation of more experienced members and the lack of in-person
				opportunities the last 2 years due to covid.
			</p>
		</div>
		<div class="my-4">
			<h3>Thrust-to-Weight Ratio</h3>
			<p>
				The usage of foam hulls instead of carbon fiber hulls means that the boat is heavier. To
				account for this, more thrusters are used, and we decided on using a six-thruster setup.
			</p>
		</div>
	</section>
	<div class="can">
		<div class="render">
			<canvas id="renderCanvas" touch-action="none" bind:this={canvas} />
			<div id="fps" bind:this={fps}>0</div>
		</div>
	</div>
	<h3>Prioritization of Challenges</h3>
	<h4>High Priority Challenges</h4>

	<section id="Navigation" class="row">
		<h3>Navigate the Panama Canal</h3>
		<img style="width:80%" src="/images/roboboat/challenges/navigationChannel.png" alt="Navigate" />
		<p>
			Description: This challenge is mandatory before attempting other tasks. The ASV needs to pass
			through two sets of gates (a pair of red and green buoys) and starts autonomous navigation at
			a minimum of 6 ft before the set of gates.
		</p>
		<p>
			Analysis: As it is mandatory, this challenge is of high importance. In 2019, the boat could
			only successfully pass the navigation channel once out of four qualification runs as a result
			of a major electrical failure onboard.
		</p>
		<p>Goal: 14 out of 15 successful runs</p>
	</section>
	<div class="can" />

	<hr />

	<section id="Obstacle" class="row">
		<h3>Magellan's Route / Count the Manatees &amp; Jellyfish</h3>
		<img style="width:80%" src="/images/roboboat/challenges/magellans_route.png" alt="Magellan's" />
		<p>
			Description: The ASV passes through between multiple sets of gates (pairs of red and green
			buoys) The ASV also avoids intermittent yellow buoys (jelly fish) and black buoys (manatees)
			of various sizes and counts them
		</p>
		<p>
			Analysis: The challenge requires minimal external hardware or software development and mainly
			just involves careful navigational operability and fine motor control. This challenge could be
			tested and fine-tuned early in the development process.
		</p>
		<p>Goal: 9 out of 10 successful runs</p>
	</section>
	<div class="can" />

	<hr />

	<section id="Speed" class="row">
		<h3>Northern Passage Challenge</h3>
		<img style="width:80%" src="/images/roboboat/challenges/snackRun.png" alt="Northern" />
		<p>
			Description: The ASV enters the gate buoys, maneuvers around the mark buoy, and exits thought
			the same gate buoys, as quickly as possible. The timer starts when the bow (front) crosses the
			gate buoys and stops when the stern (back) crosses the gate buoys.
		</p>
		<p>
			Analysis: Based on the 2019 score-sheet, a time between 25-45s is needed to remain competitive
			in the Snack Run challenge, with the fastest 2019 run coming in at 27 seconds.
		</p>
		<p>Goal: 9 out of 10 successful runs + baseline of 35 seconds, goal of 26 seconds</p>
	</section>
	<div class="can" />

	<hr />

	<h4>Medium Priority Challenges</h4>

	<section id="Docking" class="row">
		<h3>Beaching &amp; Inspecting Turtle Nests</h3>
		<img
			style="width:80%"
			src="/images/roboboat/challenges/beaching_and_turtles.png"
			alt="Beaching"
		/>
		<p>
			Description: Before the time slot starts, teams are assigned a color and must dock at the bay
			with the matching color. Once the ASV detects and enters the docking bay, it must report the
			number of "eggs" (number of circles) in the nest.
		</p>
		<p>
			Analysis: This challenge is a bit more involved in terms of CV and color/shape recognition but
			does not require external hardware development
		</p>
		<p>Goal: 9 out of 10 successful runs</p>
	</section>
	<div class="can" />
	<hr />

	<section id="Skeeball" class="row">
		<h3>Feed the Fish</h3>
		<img style="width:80%" src="/images/roboboat/challenges/feed_the_fish.png" alt="Feed" />
		<p>
			Description: The ASV detects the "feeding table" (purple frame), then lines up and shoot three
			"pellets" (racquetballs) through the frame into any of the three holes. Points are awarded if
			the ball is fired into any of the holes but less points are awarded for just landing the ball
			on the deck.
		</p>
		<p>
			Analysis: As both the Water Blast and Feeding the Fish are new challenges, UM::Autonomy chose
			to only focus on completing the Water Blast challenge this year, though work was done
			throughout the year to complete the Skeeball task in the future.
		</p>
		<p>Goal: N/A</p>
	</section>
	<div class="can" />
	<hr />

	<section id="Waterblast" class="row">
		<h3>Ponce de Leon / Fountain of Youth</h3>
		<img style="width:80%" src="/images/roboboat/challenges/ponce_de_fountain.png" alt="Ponce" />
		<p>
			Description: The ASV detects the target face (blue/white striped) and shoots enough water
			through the target to raise the ball above the green line in the pipe. The ASV may pump the
			water from the environment or store it on board.
		</p>
		<p>
			Analysis: This is the first season with this challenge and hardware and software development
			of external mechanisms pushed back actual testing. Therefore, we knew that immediate mastery
			of this task would be difficult and time consuming, and should only be attempted after other
			challenges.
		</p>
		<p>Goal: 3 out of 5 successful runs</p>
	</section>
	<div class="can" />
	<hr />

	<h4>Low Priority Challenges</h4>

	<section id="Cleanup" class="row">
		<h3>Ocean Cleanup</h3>
		<img style="width:80%" src="/images/roboboat/challenges/OceanCleanup.png" alt="Ocean" />
		<p>
			Description: The ASV detects an underwater pinger which designates the area to collect
			"debris" (raquetballs) from. The ASV may then use the collected balls as extra balls in the
			Feed the Fish challenge.
		</p>
		<p>
			Analysis: As this task is a new challenge, UM::Autonomy chose to focus on completing the Ponce
			de Leon challenge and Feeding the Fish challenge for this year, though work was done
			throughout the year to complete the Ocean Cleanup task in the future.
		</p>
		<p>Goal: N/A</p>
	</section>
	<div class="can" />
</div>

<style lang="scss">
	$padding-size: 2em;
	$small-canvas-size: 50vh;
	.outer {
		grid-template-columns: 1fr 1fr;
		column-gap: $padding-size;
		margin-left: $padding-size;
		margin-right: $padding-size;
		font-family: 'Open Sans', 'Lato', sans-serif;
		font-weight: 300;
		h2 {
			font-weight: 300;
			font-size: 2.25em;
			margin: 0 0 30px 0;
			line-height: 1.2em;
		}
		@media (min-width: 620px) {
			h2 {
				font-size: 3em;
			}
		}
		h3 {
			font-weight: 300;
			font-size: 1.5em;
			margin: 20px 0 10px 0;
		}
		@media (min-width: 620px) {
			h3 {
				font-size: 2em;
			}
		}
		hr {
			width: 100%;
		}
	}
	.row {
		min-height: 100vh;
		padding-bottom: $small-canvas-size;
	}
	.can {
		position: relative;
		margin-left: -$padding-size;
		width: 100%;
	}
	.render {
		position: absolute;
		bottom: 0;
		width: calc(100% + #{$padding-size * 2});
		height: $small-canvas-size;
	}
	@media (min-width: 928px) {
		.row {
			padding-bottom: 0vh;
		}
		.outer {
			display: grid;
			margin-left: 0;
			width: calc(100% - #{$padding-size});
			height: 100%;
		}
		.render {
			position: initial;
			height: 100%;
			width: 100%;
		}
		.can {
			position: sticky;
			top: 0;
			grid-column: 1 / 1;
			grid-row: 1 / 19;
			margin: 0;
			height: 100vh;
		}
	}
	.park-info {
		text-align: center;
		h2 {
			font-size: 4em;
			margin-bottom: 0;
		}
		h3 {
			margin: 0;
		}
		h3 + p {
			margin-top: 0;
			font-size: 1.35em;
		}
	}
	#renderCanvas {
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	#fps {
		position: absolute;
		background-color: black;
		border: 2px solid red;
		text-align: center;
		font-size: 16px;
		color: white;
		top: 15px;
		right: 10px;
		width: 60px;
		height: 20px;
	}
</style>
