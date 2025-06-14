<?php
	echo '<div class="modal fade settingsmodal" id="settingsModal" tabindex="-1" role="dialog" data-bs-theme="light" aria-labelledby="settingsModalLabel" aria-hidden="true">
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
					<div class="form-check form-switch">
						<input class="form-check-input gridlineswitch" type="checkbox" role="switch" id="gridlineswitch" onchange="setGridlines(true)">
						<label class="form-check-label" for="gridlineswitch">Toggle Gridline Visibility</label>
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
					<p>Drop letter tiles into the grid to spell words! Each time a word with at least three letters is formed, the tiles in the word will be removed from the grid. The game ends when the grid is completely filled!</p>
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
	</div>';
?>