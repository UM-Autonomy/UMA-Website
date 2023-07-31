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
	import Results from '../results.svelte';

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
			alpha: false
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
		startRenderLoop(engine, canvas);
		scene = delayCreateScene(engine);
		window.scene = scene;
	}

	onMount(() => {
		initFunction().then(() => {
			sceneToRender = scene;
		});
	});
	onDestroy(() => {
		for (const f of destroyFuncs) {
			f();
		}
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
				continents.
			</p>
			<b>UM::Autonomy placed 6th overall, and 3rd among American Universities.</b>
			<a href="#results" class="btn">Jump to Competition Results</a>
		</div>
		<h2>Competition Strategy</h2>
		<div class="my-4">
			<h3>Team Focus</h3>
			<p>
				For this competition season, we tested with the 2022 hull for most of the year, since it was
				already built. <a>A new hull made of carbon fiber</a> was being built concurrently by the mechanical
				team. At the last minute, days before departure for the competition, it was ready. The team spent
				the weekend preparing the new boat for the competition, and thanks to simulator testing, this
				process went smoothly and few code changes were needed.
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
			<canvas id="renderCanvas" touch-action="none" aria-hidden="true" bind:this={canvas} />
			<div id="fps" bind:this={fps}>0</div>
		</div>
	</div>

	<section id="Static" class="row">
		<h3>Static Judging Criteria</h3>
		<p>
			Besides a team's performance autonomously, we are judged on aspects of both our team and the
			boat.
		</p>
		<h4>Design Documentation</h4>
		<p>
			The team must prepare a website, <a>a technical design report</a>, and <a>a video</a> for judges
			to score. These are evaluated based on how well they introduce the team and its structure as well
			as design considerations of the boat.
		</p>
		<h4>Presentation</h4>
		<p>
			The team must present to the judges live their decisions leading to the design of the boat.
		</p>
		<h3>Other Judging Criteria</h3>
		<p>
			Before the boat can participate in an autonomous challenge, several prerequisite activites
			must be completed.
		</p>
		<h4>Static Safety Inspection</h4>
		<p>
			As the boats are very high powered, a runaway boat could damage itself and hurt others.
			Therefore, competition staff ensure that the boat follows several safety rules:
		</p>
		<ul>
			<li>The boat stops when a physical red button is pressed on the boat</li>
			<li>
				The boat stops when a remote switch is flipped, or the remote switch loses power or
				connection
			</li>
			<li>
				The boat does not have any sharp edges so that people in the water can touch the boat safely
			</li>
		</ul>
		<p>
			UM::Autonomy is proud to have been one of the first three teams to pass the safety inspection
			at the 2023 competition.
		</p>
		<h4>Boat Thrust-to-Weight Ratio</h4>
		<p>
			The competition rewards fast and light craft. Therefore, a sliding scale is used where points
			are lost faster the heavier it gets. The boat is weighed and its thrust is measured every day
			it is entered in the water. In 2023, UM::Autonomy's boat weighed 55 pounds, the lightst weight
			class.
		</p>
	</section>
	<div class="can" />
	<h3>Prioritization of Challenges</h3>
	<h4>High Priority Challenges</h4>

	<section id="Navigation" class="row">
		<h3>Navigate the Panama Canal</h3>
		<img src="/images/roboboat/challenges/navigationChannel.png" alt="Navigate" />
		<dl>
			<dt>Description</dt>
			<dd>
				This challenge is mandatory before attempting other tasks. The ASV needs to pass through two
				sets of gates (a pair of red and green buoys) and starts autonomous navigation at a minimum
				of 6 ft before the set of gates.
			</dd>

			<dt>Analysis</dt>
			<dd>
				As it is mandatory, this challenge is of high importance. In 2019, the boat could only
				successfully pass the navigation channel once out of four qualification runs as a result of
				a major electrical failure onboard.
			</dd>
			<dt>Goal</dt>
			<dd>14 out of 15 successful runs</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				As one of the simplest tasks, this was completed with high success. However, additional
				tuning was needed upon arrival to the competition site as the boat's computer vision system
				would occasionally fail to detect a buoy.
			</dd>
		</dl>
	</section>
	<div class="can" />

	<hr />

	<section id="Obstacle" class="row">
		<h3>Magellan's Route / Count the Manatees &amp; Jellyfish</h3>
		<img src="/images/roboboat/challenges/magellans_route.png" alt="Magellan's" />
		<dl>
			<dt>Description</dt>
			<dd>
				The ASV passes through between multiple sets of gates (pairs of red and green buoys) The ASV
				also avoids intermittent yellow buoys (jelly fish) and black buoys (manatees) of various
				sizes and counts them.
			</dd>

			<dt>Analysis</dt>
			<dd>
				The challenge requires minimal external hardware or software development and mainly just
				involves careful navigational operability and fine motor control. This challenge could be
				tested and fine-tuned early in the development process.
			</dd>
			<dt>Goal</dt>
			<dd>9 out of 10 successful runs</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				This challenge revealed some disadvantages of our indoors testing area. Specifically, our
				obstacle-avoidance system decided that the best way to avoid hitting buoys was to go outside
				of the red-green channel! While technically following our instructions, it didn't score many
				points. Although we didn't have time to fix that during the competition, the boat did go
				through several red-green pairs on some runs scoring us important points.
			</dd>
		</dl>
	</section>
	<div class="can" />

	<hr />

	<section id="Speed" class="row">
		<h3>Northern Passage Challenge</h3>
		<img src="/images/roboboat/challenges/snackRun.png" alt="Northern" />
		<dl>
			<dt>Description</dt>
			<dd>
				The ASV enters the gate buoys, maneuvers around the mark buoy, and exits thought the same
				gate buoys, as quickly as possible. The timer starts when the bow (front) crosses the gate
				buoys and stops when the stern (back) crosses the gate buoys.

				<p>The team colloquially refers to this as the "Speed Challenge".</p>
			</dd>

			<dt>Analysis</dt>
			<dd>
				Based on the 2019 score-sheet, a time between 25-45s is needed to remain competitive in the
				Northern Passage challenge, with the fastest 2019 run coming in at 27 seconds.
			</dd>
			<dt>Goal</dt>
			<dd>
				9 out of 10 successful runs. We hope for a baseline of 35 seconds, and a goal of 26 seconds.
			</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				Another disadvantage of indoors testing was highlighted here: buoy interference.
				Specifically, our computer vision system had a hard time distinguising the blue buoy
				(marking where to turn around) from the black buoys (marking an obstacle to avoid in the
				previous challenge, Magellan's Route). When we tested indoors, we only tested one or two
				challenges at a time, and with different lighting.
			</dd>
		</dl>
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
		<dl>
			<dt>Description</dt>
			<dd>
				Before the time slot starts, teams are assigned a color and must dock at the bay with the
				matching color. Once the ASV detects and enters the docking bay, it must report the number
				of "eggs" (number of circles) in the nest.

				<p>The team colloquially refers to this challenge as "Docking."</p>
			</dd>

			<dt>Analysis</dt>
			<dd>
				This challenge is a bit more involved in terms of computer and color/shape recognition but
				does not require external hardware development.
			</dd>
			<dt>Goal</dt>
			<dd>9 out of 10 successful runs</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				This task turned out easier than expected. Matching on color rather than number of dots on
				the board turned out rather easy. Scoring involved simply hitting the docks.
			</dd>
		</dl>
	</section>
	<div class="can" />
	<hr />

	<section id="Skeeball" class="row">
		<h3>Feed the Fish</h3>
		<img src="/images/roboboat/challenges/feed_the_fish.png" alt="Feed" />
		<dl>
			<dt>Description</dt>
			<dd>
				The ASV detects the "feeding table" (purple frame), then lines up and shoot three "pellets"
				(racquetballs) through the frame into any of the three holes. Points are awarded if the ball
				is fired into any of the holes but fewer points are awarded for just landing the ball on the
				deck.

				<p>
					The team colloquially refers to this challenge as "Skeeball," the classic arcade game.
				</p>
			</dd>

			<dt>Analysis</dt>
			<dd>
				As both the Ponce de Leon (<em>see next</em>) and Feeding the Fish are new challenges,
				UM::Autonomy chose to only focus on completing the Ponce de Leon challenge this year, though
				work was done throughout the year to complete the Skeeball task in the future.
			</dd>
			<dt>Goal</dt>
			<dd>N/A</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				<em>See next task</em>
			</dd>
		</dl>
	</section>
	<div class="can" />
	<hr />

	<section id="Waterblast" class="row">
		<h3>Ponce de Leon / Fountain of Youth</h3>
		<img src="/images/roboboat/challenges/ponce_de_fountain.png" alt="Ponce" />
		<dl>
			<dt>Description</dt>
			<dd>
				The ASV detects the target face (blue/white striped) and shoots enough water through the
				target to raise the ball above the green line in the pipe. The ASV may pump the water from
				the environment or store it on board.

				<p>The team colloquially refers to this challenge as "Water Blast."</p>
			</dd>

			<dt>Analysis</dt>
			<dd>
				This is the first season with this challenge and hardware and software development of
				external mechanisms pushed back actual testing. Therefore, we knew that immediate mastery of
				this task would be difficult and time consuming, and should only be attempted after other
				challenges.
			</dd>
			<dt>Goal</dt>
			<dd>3 out of 5 successful runs</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				Although we had planned to focus on shooting water rather than balls, it turned out that
				water leakage was a big worry: if the pump failed and dumped water in the boat's
				electronics, we wouldn't be able to compete anymore. As such, we re-focued our effort on
				Feed the Fish. We finally had a working ball-shooting system while at the competition site,
				but lack of testing time meant that it couldn't be integrated in time.

				<p>
					Both tasks only had three teams that could shoot anything. No teams landed balls in the
					buckets.
				</p>
			</dd>
		</dl>
	</section>
	<div class="can" />
	<hr />

	<h4>Low Priority Challenges</h4>

	<section id="Cleanup" class="row">
		<h3>Ocean Cleanup</h3>
		<img src="/images/roboboat/challenges/OceanCleanup.png" alt="Ocean" />
		<dl>
			<dt>Description</dt>
			<dd>
				The ASV detects an underwater pinger which designates the area to collect "debris"
				(raquetballs) from. The ASV may then use the collected balls as extra balls in the Feed the
				Fish challenge.
			</dd>

			<dt>Analysis</dt>
			<dd>
				As this task is a new challenge, UM::Autonomy chose to focus on completing the Ponce de Leon
				challenge and Feeding the Fish challenge for this year, though work was done throughout the
				year to complete the Ocean Cleanup task in the future.
			</dd>
			<dt>Goal</dt>
			<dd>N/A</dd>
			<dt>Post-competition Remarks</dt>
			<dd>
				This was one of the hardest challenges this year. Only a couple teams even had the hardware
				to participate, and none scored points. We will need to evaluate again whether this task is
				worth pursuing next year.
			</dd>
		</dl>
	</section>
	<div class="can" />
</div>

<Results />

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
		dt {
			font-weight: bold;
			&::after {
				content: ':';
			}
		}
		dd {
			margin-left: 1em;
			p {
				margin-bottom: 0;
			}
		}

		@media (min-width: 620px) {
			dl {
				display: grid;
				grid-template-columns: min-content auto;
				row-gap: 1em;
			}
			dt {
				text-align: right;
			}
		}

		img {
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
		pointer-events: none;
	}
	.can:has(canvas) {
		pointer-events: all;
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
			grid-row: 1 / 21;
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
