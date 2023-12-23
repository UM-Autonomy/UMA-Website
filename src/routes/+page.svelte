<script lang="ts">
	import { onMount } from 'svelte';
	import start from '../loader';
	import urls from '../fixUrls';
	import Results from '../results.svelte';

	let canvas: HTMLCanvasElement;
	// let fps: HTMLElement;
	let container: HTMLElement;

	onMount(() => {
		return start(
			() =>
				new Worker(new URL('../core.ts', import.meta.url), {
					type: 'module'
				}),
			urls,
			'/model2.glb',
			'/textures/environment.env',
			false,
			container,
			canvas /* , fps */
		);
	});
</script>

<div class="outer" class:loaded={false} bind:this={container}>
	<section
		class="row"
		data-location="266, 3, -510"
		data-radius="200"
		data-alpha="-1.15"
		data-beta="0.966"
		data-speed="0.3"
	>
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
				For this competition season, we tested with the 2022 hull (itself a refurbished 2017 hull)
				for most of the year, since it was already built. <a>A new hull made of carbon fiber</a> was
				being built concurrently by the mechanical team. At the last minute, days before departure for
				the competition, it was ready. The team spent the weekend preparing the new boat for the competition,
				and thanks to simulator testing, this process went smoothly and few code changes were needed.
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
			<canvas id="renderCanvas" aria-hidden="true" bind:this={canvas} />
			<!-- <div id="fps" bind:this={fps}>0</div> -->
		</div>
		<img src="/images/roboboat/challenges/intro.png" alt="" />
	</div>
	<div />

	<section
		class="row"
		data-location="302, 0, -385"
		data-radius="30"
		data-beta="1.2"
		data-speed="0.2"
	>
		<h3>Static Judging Criteria</h3>
		<p>
			Besides a team's performance autonomously, we are judged on aspects of both our team and the
			boat.
		</p>
		<h4>Design Documentation</h4>
		<p>
			The team must prepare a website, <a>a technical design report</a>, and
			<a href="https://www.youtube.com/watch?v=ZxFV9WLaQ88" target="_blank" rel="noopener"
				>a video</a
			> for judges to score. These are evaluated based on how well they introduce the team and its structure
			as well as design considerations of the boat.
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>
	<div>
		<h3>Prioritization of Challenges</h3>
		<h4>High Priority Challenges</h4>
	</div>

	<section
		class="row"
		data-location="307.7, 0, -375.6"
		data-radius="15"
		data-alpha="3.14"
		data-beta="0.938"
		data-speed="0.1"
	>
		<h3>Navigate the Panama Canal</h3>
		<img src="/images/roboboat/challenges/navigationChannel.png" alt="Panama Canal Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>

	<hr />

	<section
		class="row"
		data-location="319.3, 0, -381.9"
		data-radius="25"
		data-beta="0.938"
		data-speed="0.1"
	>
		<h3>Magellan's Route / Count the Manatees &amp; Jellyfish</h3>
		<img src="/images/roboboat/challenges/magellans_route.png" alt="Magellan's Route Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>
	<hr />

	<section
		class="row"
		data-location="311.08, 0, -387.039"
		data-radius="15"
		data-beta="0.938"
		data-speed="0.1"
	>
		<h3>Northern Passage Challenge</h3>
		<img src="/images/roboboat/challenges/snackRun.png" alt="Northern Passage Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>
	<div>
		<hr />

		<h4>Medium Priority Challenges</h4>
	</div>

	<section
		class="row"
		data-location="313.619, 0, -398.136"
		data-radius="12"
		data-beta="0.938"
		data-alpha="1.57"
		data-speed="0"
	>
		<h3>Beaching &amp; Inspecting Turtle Nests</h3>
		<img
			style="width:80%"
			src="/images/roboboat/challenges/beaching_and_turtles.png"
			alt="Beaching & Inspecting Turtle Nests Diagram"
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>
	<hr />

	<section
		class="row"
		data-location="304.417, 0, -385.015"
		data-radius="12"
		data-beta="0.938"
		data-alpha="3.14"
		data-speed="0.1"
	>
		<h3>Feed the Fish</h3>
		<img src="/images/roboboat/challenges/feed_the_fish.png" alt="Feed the Fish Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>
	<hr />

	<section
		class="row"
		data-location="303.513, 0, -390.266"
		data-radius="12"
		data-beta="0.938"
		data-alpha="3.14"
		data-speed="0.1"
	>
		<h3>Ponce de Leon / Fountain of Youth</h3>
		<img src="/images/roboboat/challenges/ponce_de_fountain.png" alt="Ponce de Leon Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>

	<div>
		<hr />
		<h4>Low Priority Challenges</h4>
	</div>

	<section
		class="row"
		data-location="301.393, 0, -395.65"
		data-radius="12"
		data-beta="0.938"
		data-speed="0.1"
	>
		<h3>Ocean Cleanup</h3>
		<img src="/images/roboboat/challenges/OceanCleanup.png" alt="Ocean Cleanup Diagram" />
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
	<div class="can">
		<img
			loading="lazy"
			decoding="async"
			src="/images/roboboat/challenges/feed_the_fish.png"
			alt=""
		/>
	</div>

	<section>
		<em>
			UM::Autonomy extends a special thanks to Cole Biesemeyer from the Open Source Robotics
			Foundation for the 3D model of Nathan Benderson Park and Gdańsk University of Technology's
			SeaSentinel team for creating 3D models of various competition elements.
		</em>
	</section>
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
		.render {
			display: none;
		}
	}
	.outer.loaded {
		.render {
			display: initial;
		}
		.can {
			// pointer-events: none;
			&:has(canvas) {
				pointer-events: all;
			}
			img {
				display: none;
			}
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
		img {
			object-fit: cover;
		}
	}
	.can > * {
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
			grid-auto-flow: row dense;
			margin-left: 0;
			width: calc(100% - #{$padding-size});
			height: 100%;
		}
		.can > * {
			position: initial;
			height: 100%;
			width: 100%;
		}
		.outer > * {
			grid-column: 2 / 2;
		}
		.can {
			grid-column: 1 / 1;
			grid-row: span 2;
		}
		.outer.loaded .can {
			position: sticky;
			top: 0;
			grid-row: 1 / -1;
			margin: 0;
			height: min-content;
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
		touch-action: manipulation !important;
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
