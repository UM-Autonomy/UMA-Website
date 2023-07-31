<div class="content competition-results">
	<section class="info">
		<div id="results" class="container flex">
			<div class="text">
				<h1>Competition Results</h1>
				<p>UM::Autonomy placed <b>6th</b> overall, and <b>3rd</b> among American Universities.</p>
			</div>
		</div>
	</section>

	<section class="join-section text-maize bg-blue">
		<img
			decoding="async"
			loading="lazy"
			class="img"
			src="/images/roboboat/2023/3rdplace.webp"
			style="object-position: 59% 50%"
			alt="UM::Autonomy members pose on-stage with a judge holding a banner reading &quot;2023 3rd place design documentation&quot;"
		/>
		<div>
			<h2>Static Judging</h2>
			<p>
				UM::Autonomy placed <b>1st</b> in <a>the techincal report</a>, <b>2nd</b> in
				<a>the video</a>, and <b>3rd</b> in the presentation for an overall <b>3rd</b> place in design
				documentation.
			</p>
		</div>
	</section>

	<section class="join-section text-blue bg-maize">
		<img
			decoding="async"
			loading="lazy"
			class="img"
			src="/images/roboboat/2023/inwater.webp"
			alt="The UM::Autonomy 2023 boat in the water"
		/>
		<div>
			<h2>Autonomous Challenge</h2>
			<p>UM::Autonomy placed 9th. 13 teams scored no points in the autonomous challenge.</p>
		</div>
	</section>

	<section class="join-section text-maize bg-blue">
		<img
			decoding="async"
			loading="lazy"
			class="img"
			src="/images/roboboat/2023/teamfun.webp"
			style="object-position: 46% 50%"
			alt="The UM::Autonomy members in a fun pose surrounding the boat"
		/>
		<div>
			<h2>The Team</h2>
			<p>
				The team feels very confident for the 2024 season. Many new members attended competition for
				the first time, creating an exciting environment where many members are familiar with
				competition practices allowing us to achieve further success in future years.
			</p>
		</div>
	</section>
</div>

<style lang="scss">
	$join-height: 50vh;
	$join-divider-height: 1.5rem;
	$join-clip: calc(#{$join-height} / 6);
	.competition-results {
		h1 {
			font-size: 3rem;
			text-align: center;
		}
		h2 {
			text-align: center;
			font-size: 2rem;
		}
		p {
			font-size: 1.3rem;
		}
		.info {
			text-align: center;
		}
	}
	.join-section {
		grid-template-columns: 1fr 1fr;
		.img {
			width: 98%;
			padding: 1%;
			object-fit: cover;
			overflow: hidden;
		}
		> div {
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding-left: 1em;
			padding-right: 1em;
			padding-bottom: 1em;
		}
		&:nth-child(2n) > div {
			grid-row: 1 / 1;
		}
	}
	@media (min-width: 928px) {
		.join-section {
			height: $join-height;
			display: grid;
			.img {
				width: 100%;
				height: 100%;
				padding: 0;
			}
			> div {
				padding: 2em;
				margin-bottom: calc(#{$join-clip} / 2);
			}
		}
		.join-section ~ .join-section {
			height: calc(#{$join-height} + #{$join-clip});
			margin-top: calc(-1 * #{$join-clip});
			clip-path: polygon(0 0, 100% $join-clip, 100% 100%, 0 100%);
			> div {
				margin-bottom: 0;
			}
		}
	}
	.text-maize {
		color: #ffcb05;
		&,
		p {
			font-weight: 500;
		}
	}
	.text-blue {
		color: #00274c;
		&,
		p {
			font-weight: 500;
		}
	}
	.bg-maize {
		background: #ffcb05;
	}
	.bg-blue {
		background: #00274c;
	}
</style>
