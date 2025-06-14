<?php session_start(); ?>
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
					"vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
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
		
		<?php include('_modals.php'); ?>
	
		<div style="text-align: center"><div id="app"></div></div>
		
		<script type="module">
			import { createApp } from 'vue';
			import app from './js/app.js';
			createApp(app).mount('#app');
		</script>
		
		<!-- Bootstrap JavaScript CDN -->
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
		
		<!--<script>
			const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
			const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
		</script>
		<script>
			var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
			var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
				return new bootstrap.Tooltip(tooltipTriggerEl);
			})
		</script>-->
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