// THEME SELECTION

var curtheme = 0;
if(sessionStorage.getItem("theme") != null)
{
	curtheme = sessionStorage.getItem("theme");
}

let properties = ['backgroundColour', 'fontColour'];
const themes = [
	[ // dark mode
		'black',
		'white',
		'dark'
	],
	[ // light mode
		'white',
		'black',
		'light'
	]
];

function setTheme(change = false)
{
	let theme = 0;
	if(change)
	{
		if(document.getElementById("darkmodeswitch").checked)
		{
			theme = 0;
		}
		else
		{
			theme = 1;
		}
	}
	else
	{
		if(sessionStorage.getItem("theme") != null)
		{
			theme = sessionStorage.getItem("theme");
		}
	}
	if(theme == 0)
	{
		document.getElementById("darkmodeswitch").checked = true;
	}
	else
	{
		document.getElementById("darkmodeswitch").checked = false;
	}
	
	let params = new URLSearchParams(document.location.search);
	let from = params.get("from");
	if(from && from === 'portfolio')
	{
		console.log(theme);
		if([0,1,6,8].includes(parseInt(theme)))
		{
			theme = 0;
		}
		else
		{
			theme = 1;
		}
	}
	else
	{
		sessionStorage.setItem("theme", theme);
	}

	let r = document.querySelector(':root');
	const themevars = themes[theme];
	
	for(let i = 0; i < properties.length; i++)
	{
		let r = document.querySelector(':root');
		r.style.setProperty('--' + properties[i], themes[theme][i]);
	}
	
	let mode;
	mode = themes[theme][2];
	
	let modals = ["settingsModal", "infoModal", "levelModal", "infoModalStart", "gameOverModal", "loginModal", "signupModal", "loginModal2", "signupModal2"];
	for(let i = 0; i < modals.length; i++)
	{
		if(document.getElementById(modals[i]))
		{
			document.getElementById(modals[i]).setAttribute("data-bs-theme", mode);
		}
	}
	
	if(mode === "dark")
	{
		document.body.classList.add("darkmode");
	}
	else
	{
		document.body.classList.remove("darkmode");
	}
}

// MOBILE BUTTONS
var touchscreen = 1;
if(sessionStorage.getItem("touchscreen") != null)
{
	touchscreen = sessionStorage.getItem("touchscreen");
}
function setTouchscreen(change = false)
{
	if(change)
	{
		if(document.getElementById("touchswitch").checked)
		{
			touchscreen = 1;
		}
		else
		{
			touchscreen = 0;
		}
	}
	else
	{
		if(sessionStorage.getItem("touchscreen") != null)
		{
			touchscreen = sessionStorage.getItem("touchscreen");
		}
	}
	if(touchscreen == 1)
	{
		document.getElementById("touchswitch").checked = true;
	}
	else
	{
		document.getElementById("touchswitch").checked = false;
	}
	sessionStorage.setItem("touchscreen", touchscreen);
	
	let mobilebuttons = document.getElementById("mobilebuttons");
	if(mobilebuttons)
	{
		if(touchscreen == 1)
		{
			mobilebuttons.style.display = "block";
		}
		else
		{
			mobilebuttons.style.display = "none";
		}
	}
}

// GRIDLINES
var gridlines = 0;
if(sessionStorage.getItem("gridlines") != null)
{
	gridlines = sessionStorage.getItem("gridlines");
}
function setGridlines(change = false)
{
	if(change)
	{
		if(document.getElementById("gridlineswitch").checked)
		{
			gridlines = 1;
		}
		else
		{
			gridlines = 0;
		}
	}
	else
	{
		if(sessionStorage.getItem("gridlines") != null)
		{
			gridlines = sessionStorage.getItem("gridlines");
		}
	}
	if(gridlines == 1)
	{
		document.getElementById("gridlineswitch").checked = true;
	}
	else
	{
		document.getElementById("gridlineswitch").checked = false;
	}
	sessionStorage.setItem("gridlines", gridlines);
	
	if(gridlines == 1)
	{
		document.body.classList.add("gridlines");
	}
	else
	{
		document.body.classList.remove("gridlines");
	}
}

function applySettings()
{
	setTheme();
	setTouchscreen();
	setGridlines();
}


// LOADER

document.onreadystatechange = function()
{
	if(document.readyState !== "complete")
	{
		document.querySelector("body").style.visibility = "hidden";
		document.querySelector("#loader-container").style.visibility = "visible";
	}
	else
	{
		document.querySelector("#loader-container").style.display = "none";
		document.querySelector("body").style.visibility = "visible";
	}
};


// LOGIN / SIGNUP

let loginError = 0;
function openLoginModal()
{
	loginError = 0;
	let modal = new bootstrap.Modal(document.getElementById("loginModal"));
	modal.show();
}
function openSignupModal()
{
	loginError = 0;
	let modal = new bootstrap.Modal(document.getElementById("signupModal"));
	modal.show();
}
function login()
{
	let username = document.getElementById("username").value;
	let pwd = document.getElementById("password").value;
	// send game data to be stored in database
	let data = "gamedata=" + encodeURIComponent(JSON.stringify({
		"username": username,
		"password": pwd
	}));

	var xhr = new XMLHttpRequest();

	xhr.open("POST", "savedata.php", true);

	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function()
	{
		if(xhr.readyState === XMLHttpRequest.DONE)
		{
			if(xhr.status === 200)
			{
				if(xhr.responseText === "login error")
				{
					loginError = 1;
					document.getElementById("loginerror").style.display = "block";
				}
				else if(xhr.responseText.includes("userid "))
				{
					loginError = 0;
					let userid = xhr.responseText.split(" ")[1];
					sessionStorage.setItem("userid", userid);
					window.location.reload();
				}
				else
				{
					console.log(xhr.responseText);
				}
			}
			else
			{
				console.error("Error:", xhr.status);
			}
		}
	};
	xhr.send(data);
}
function signup()
{
	let username = document.getElementById("username_signup").value;
	let pwd = document.getElementById("password_signup").value;
	// send game data to be stored in database
	let data = "gamedata=" + encodeURIComponent(JSON.stringify({
		"signup": true,
		"username": username,
		"password": pwd
	}));

	var xhr = new XMLHttpRequest();

	xhr.open("POST", "savedata.php", true);

	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function()
	{
		if(xhr.readyState === XMLHttpRequest.DONE)
		{
			if(xhr.status === 200)
			{
				if(xhr.responseText === "username taken")
				{
					loginError.value = 2;
					document.getElementById("signuperror").style.display = "block";
				}
				else if(xhr.responseText.includes("userid "))
				{
					loginError.value = false;
					let userid = xhr.responseText.split(" ")[1];
					sessionStorage.setItem("userid", userid);
					console.log(sessionStorage.getItem("userid"));
					window.location.reload();
				}
				else
				{
					console.log(xhr.responseText);
				}
			}
			else
			{
				console.error("Error:", xhr.status);
			}
		}
	};
	xhr.send(data);
}