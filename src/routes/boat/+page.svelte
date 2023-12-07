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

<div class="relative text-white" class:loaded={false} bind:this={container}>
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
	>
		<div class="my-4">
			<h3>Camera</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="2"
	>
		<div class="my-4">
			<h3>Lidar</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="3"
	>
		<div class="my-4">
			<h3>GPS</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="4"
	>
		<div class="my-4">
			<h3>Ubiquiti Rocket</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="4.7"
	>
		<div class="my-4">
			<h3>T500 Thrusters</h3>
		</div>
	</div>
	<div
		class="row"
        data-seconds="7"
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
	>
		<div class="my-4">
			<h3>Beelink SEi12</h3>
		</div>
	</div>
    <div class="h-screen"></div>
</div>

<style lang="scss">
    .outer {
        position: relative;
    }
    .render {

    }
</style>
