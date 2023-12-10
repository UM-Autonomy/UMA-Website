<script lang="ts">
	import { onMount } from 'svelte';
	import start from '../../loader';
	import '../../fixUrls';
	import '../../main.css';

	let canvas: HTMLCanvasElement;
	// let fps: HTMLElement;
	let container: HTMLElement;

	onMount(() => {
		return start('/boatanim.glb', true, container, canvas /* , fps */);
	});
</script>

<div class="relative text-white boat-description-outer" class:loaded={false} bind:this={container}>
	<div class="sticky inset-0 -z-10 h-screen">
		<div class="w-full h-full">
			<canvas class="w-full h-full" aria-hidden="true" bind:this={canvas} />
			<!-- <div id="fps" bind:this={fps}>0</div> -->
		</div>
		<!-- <img src="/images/roboboat/challenges/intro.png" alt="" /> -->
	</div>
	<div class="boat-description">
		<div class="row" class:active={false} data-seconds="1.666" data-highlight="Camera">
			<h3>Camera</h3>
			<p>
				The Phoenix's camera provides the main input to the boat's autonomous capabilities. Using
				the YOLOv8 computer vision algorithm, all competition elements are detected.
			</p>
		</div>
		<div class="row" data-seconds="2" data-highlight="TrimSrf.032">
			<h3>LiDAR</h3>
			<p>
				The Velodyne Puck (previously known as VLP-16) provides the boat with a 3D map of its
				surroundings. Using detection data from the camera, the LiDAR provides supplemental depth
				data to determine objects' distance.
			</p>
		</div>
		<div class="row" data-seconds="3" data-highlight="Brep.017,Brep.018">
			<h3>GPS Antennas</h3>
			<p>
				Dual antennas enable the boat to ascertain its heading with remarkable sub-degree accuracy.
				This precision reduces reliance on magnetic sensors, thereby mitigating any potential
				inaccuracies or inconsistencies due to magnetic disturbances or anomalies in the
				environment. This positions the vessel for superior navigation performance under a variety
				of conditions.
			</p>
		</div>
		<div class="row" data-seconds="4" data-highlight="Thruster Left,Thruster Right">
			<h3>T500 Thrusters</h3>
			<p>
				Two Blue Robotics T500 Thrusters provide the Phoenix with powerfulthrust. By placing the
				thrusters below the hulls to allow clean water flow at the inlets, ventilation is avoided.
			</p>
		</div>
		<div class="row" data-seconds="4.7" data-highlight="Brep.022">
			<h3>Ubiquiti Rocket</h3>
			<p>
				A high-performance, high-range WiFi system allows near-Gigabit communication between the
				boat and shore.
			</p>
		</div>
		<div class="row" data-seconds="7" data-highlight="Battery">
			<h3>6-cell Lithium Battery</h3>
			<p>
				A 22.2 Volt, 222 Watt-hour battery provides the boat with a powerful electricity source.
			</p>
		</div>
		<div class="row" data-seconds="8.5" data-highlight="VN300_Rugged">
			<h3>VN-300 GPS and IMU</h3>
			<p>
				The VN-300 provides inertial sensors, dual GPS receivers, and sophisticated Kalman filtering
				algorithms. This combination provides extremely accurate estimates of the vessel's position,
				velocity, and attitude. It ensures unmatched performance under both static and dynamic
				conditions, providing high precision direction data for the vessel's navigation tasks.
			</p>
		</div>
		<div class="row" data-seconds="12" data-highlight="mini computer">
			<h3>Beelink SEi12</h3>
			<p>
				Featuring an Intel i5-12450H processor and 16GB RAM, this compact computer outperforms many
				similar-sized alternatives. Despite its superior performance, it maintains impressive
				efficiency with an idle power draw of just 5 Watts. The processor's integrated graphics
				enhance computer vision tasks, delivering outstanding results. The computer is outfitted
				with a 1 Terabyte drive to store data from competition runs.
			</p>
		</div>
		<div class="h-screen" />
	</div>
</div>

<style lang="scss">
	.boat-description {
		backdrop-filter: blur(5px);
		background-color: #00274c77;
		max-width: 30em;
		padding-right: 2rem;
		padding-left: 1rem;
		.row {
			margin-bottom: 5em;
			text-align: justify;
			h3 {
				font-size: 3rem;
				text-align: left;
				text-wrap: balance;
				line-height: 1;
				margin-bottom: 1rem;
			}
		}
	}
	.boat-description-outer.loaded {
		.row {
			opacity: 0.7;
		}
		.row.active {
			opacity: 1;
		}
	}
</style>
