<!DOCTYPE html>
<html>
	<head>
		<title>Lettris - Play</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		
		<meta name="keywords" content="Lettris, words, letters, spelling" />  
		<meta name="description" content="A word game where the goal is to spell words by dropping letter tiles into a grid without letting it fill completely." />
		
		<link rel="icon" type="image/x-icon" href="favicon.ico">

		<!-- Bootstrap CSS CDN -->
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
		
		<!-- Fonts -->
		<link href="https://fonts.googleapis.com/css2?family=Lexend&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css2?family=Iceland&display=swap" rel="stylesheet">
				
		<!-- For icons -->
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

		<!-- JQuery -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		
		<!-- Vue.js -->
		<script type="importmap">
			{
				"imports": {
					"vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
				}
			}
		</script>
		
		<!-- CSS -->
        <link rel="stylesheet" href="css/main.css">
		
		<script src="js/themeselect.js"></script>
	</head>
	
	<body>
		<?php include("_loader.php"); ?>
		<div class="header">
			<div style="flex-basis: 50%;">
				<a class="iconlink" href="#" data-bs-toggle="modal" data-bs-target="#settingsModal">
					<i class="fa-solid fa-gear fa-xl" style="color: #a3f5f7"></i>
				</a>
				<a class="iconlink" style="margin-right: 15px" href="#" data-bs-toggle="modal" data-bs-target="#infoModal">
					<i class="fa-regular fa-circle-question fa-xl" style="color: #f7a3e8"></i>
				</a>
			</div>
			<div class="heading m-3" style="text-align: center">
				<a href="index.php" style="text-decoration: none"><span style="color: #ffe76b">L</span><span style="color: #c5a6f7">E</span><span style="color: #a3f7bc">T</span><span style="color: #a3f7bc">T</span><span style="color: #f7a3e8">R</span><span style="color: #a3f5f7">I</span><span style="color: #efebf0">S</span></a>
			</div>
			<div style="flex-basis: 50%;"></div>
		</div>
		
		<div class="modal fade settingsmodal" id="settingsModal" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="settingsModalLabel" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="settingsModalLabel"><b>Settings</b></h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="form-check form-switch">
							<input class="form-check-input darkmodeswitch" type="checkbox" role="switch" id="darkmodeswitch" onchange="setTheme(true)">
							<label class="form-check-label" for="darkmodeswitch">Dark Mode</label>
						</div>
						<div class="form-check form-switch">
							<input class="form-check-input touchswitch" type="checkbox" role="switch" id="touchswitch" onchange="setTouchscreen(true)" checked>
							<label class="form-check-label" for="touchswitch">Add Arrow Buttons Below Gameboard (for touchscreen users)</label>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div class="modal fade infomodal" id="infoModal" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="infoModalLabel" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="infoModalLabel"><b>How to Play</b></h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Drop letter tiles into the grid to spell words! Each time a word is formed, the tiles in the word will be removed from the grid. The game ends when the grid is completely filled!</p>
						<p>Use the <b>left and right arrow keys</b> to decide where the next tile falls, and press the <b>down arrow key</b> or <b>enter key</b> to drop the tile immediately.</p>
						<p>You can also use the <b>up arrow key</b> to bank a tile for later - if you already have a tile in the bank, you will be swapping your current tile for the banked one.</p>
						<p>If you create high-scoring words, you may encounter some <b>special tiles</b> that provide a score bonus when played! The list of special tiles is given below.</p>
						<table class="gemtable" style="border-collapse: separate; border-spacing: 0">
							<tr>
								<td>
									<div class="tile gemtile tile1">
										<div class="fixed-height"><p>C</p></div>
									</div>
								</td>
								<td>
									<b>Citrine Tile</b><br />
									1.15x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile2">
										<div class="fixed-height"><p>A</p></div>
									</div>
								</td>
								<td>
									<b>Amethyst Tile</b><br />
									1.2x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile3">
										<div class="fixed-height"><p>E</p></div>
									</div>
								</td>
								<td>
									<b>Emerald Tile</b><br />
									1.25x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile4">
										<div class="fixed-height"><p>K</p></div>
									</div>
								</td>
								<td>
									<b>Kunzite Tile</b><br />
									1.3x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile5">
										<div class="fixed-height"><p>Q</p></div>
									</div>
								</td>
								<td>
									<b>Aquamarine Tile</b><br />
									1.35x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile6">
										<div class="fixed-height"><p>D</p></div>
									</div>
								</td>
								<td>
									<b>Diamond Tile</b><br />
									1.5x Multiplier
								</td>
							</tr>
							<tr>
								<td>
									<div class="tile gemtile tile7">
										<div class="fixed-height"><p>P</p></div>
									</div>
								</td>
								<td>
									<b>Prismatic Tile</b><br />
									2x Multiplier
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
		</div>
	
		<div style="text-align: center"><div id="app"></div></div>
		
		<script type="module">
			import { createApp } from 'vue';
			import app from './js/app.js';
			createApp(app).mount('#app');
		</script>
		
		<!-- Bootstrap JavaScript CDN -->
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

		<style>
			.tooltip .tooltip-inner {
				background-color: #fffbc7;
				color: black;
				font-weight: bold;
				border: 1px solid black;
			}
			.tooltip.show
			{
				opacity: 1;
			}
		</style>
	</body>
</html>
