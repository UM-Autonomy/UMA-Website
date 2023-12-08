<script lang="ts">
	import { onMount } from 'svelte';
	import start from '../../loader';
	import '../../fixUrls';
    import "../../main.css";

	let canvas: HTMLCanvasElement;
	// let fps: HTMLElement;
	let container: HTMLElement;

	onMount(() => {
		return start('/boatanim.glb', true, container, canvas /* , fps */);
	});
</script>

<div class="relative text-white boat-description" class:loaded={false} bind:this={container}>
	<div class="sticky inset-0 -z-10 h-screen">
		<div class="w-full h-full">
			<canvas class="w-full h-full" aria-hidden="true" bind:this={canvas} />
			<!-- <div id="fps" bind:this={fps}>0</div> -->
		</div>
		<!-- <img src="/images/roboboat/challenges/intro.png" alt="" /> -->
	</div>
	<div
		class="row"
        data-seconds="1.666"
		data-highlight="Camera"
	>
		<div class="my-4">
			<h3>Camera</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="2"
		data-highlight="TrimSrf.032"
	>
		<div class="my-4">
			<h3>Lidar</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="3"
		data-highlight="Brep.017,Brep.018"
	>
		<div class="my-4">
			<h3>GPS</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="4"
		data-highlight="Thruster Left,Thruster Right"
	>
		<div class="my-4">
			<h3>T500 Thrusters</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="4.7"
		data-highlight="Brep.022"
	>
		<div class="my-4">
			<h3>Ubiquiti Rocket</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="7"
		data-highlight="Battery"
	>
		<div class="my-4">
			<h3>200Wh Battery</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="8.5"
		data-highlight="VN300_Rugged"
	>
		<div class="my-4">
			<h3>VN-300 GPS and IMU</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="12"
		data-highlight="mini computer"
	>
		<div class="my-4">
			<h3>Beelink SEi12</h3>
		</div>
	</div>
    <div class="h-screen"></div>
</div>

<style lang="scss">
    .boat-description .row {
		margin-bottom: 5em;
	}
</style>
