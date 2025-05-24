// THEME SELECTION

var curtheme = 0;
if(sessionStorage.getItem("theme") != null)
{
	curtheme = sessionStorage.getItem("theme");
}

let properties = ['backgroundColour', 'fontColour'];
const themes = [
	[ // light mode
		'white',
		'black',
		'light'
	],
	[ // dark mode
		'black',
		'white',
		'dark'
	]
];

function setTheme(change = false)
{
	let theme = 0;
	if(change)
	{
		if(document.getElementById("darkmodeswitch").checked)
		{
			theme = 1;
		}
		else
		{
			theme = 0;
		}
	}
	else
	{
		if(sessionStorage.getItem("theme") != null)
		{
			theme = sessionStorage.getItem("theme");
		}
	}
	if(theme == 1)
	{
		document.getElementById("darkmodeswitch").checked = true;
	}
	else
	{
		document.getElementById("darkmodeswitch").checked = false;
	}
	sessionStorage.setItem("theme", theme);

	let r = document.querySelector(':root');
	const themevars = themes[theme];
	
	for(let i = 0; i < properties.length; i++)
	{
		let r = document.querySelector(':root');
		r.style.setProperty('--' + properties[i], themes[theme][i]);
	}
	
	let mode;
	mode = themes[theme][2];
	
	let modals = ["settingsModal", "infoModal", "levelModal", "infoModalStart", "gameOverModal", "loginModal", "signupModal"];
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
