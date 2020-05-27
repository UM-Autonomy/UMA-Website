$(document).ready(function () {
	var header = document.getElementById("mainHeader");

	// Change the header of the page
	function changeHeader() {
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		header.classList.toggle("header-background", scrollTop >= 50 || document.body.classList.contains("nav-open"));
	}

	$(window).scroll(function () {
		changeHeader();
	});

	// Allow links and navbar transition to work in sandwich mode 
	document.getElementById("open-nav").addEventListener("click", function (event) {
		event.preventDefault();
		document.body.classList.toggle("nav-open");
		changeHeader();
	});

	changeHeader();

})();
