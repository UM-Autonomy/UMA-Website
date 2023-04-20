(function () {
function init() {
	var header = document.getElementById("mainHeader");

	// Change the header of the page
	function changeHeader() {
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		header.classList.toggle("header-background", scrollTop >= 50 || document.body.classList.contains("nav-open"));
	}

	window.addEventListener('scroll', function () {
		changeHeader();
	});

	// Allow links and navbar transition to work in sandwich mode 
	document.getElementById("open-nav").addEventListener("click", function (event) {
		event.preventDefault();
		document.body.classList.toggle("nav-open");
		changeHeader();
	});

	changeHeader();

	SimpleJekyllSearch({
		searchInput: document.getElementById('search-input'),
		resultsContainer: document.getElementById('results-container'),
		json: '/search.json'
	});
	AOS.init();
}
var loaded = false;
function onLoad() {
	if (!loaded && document.readyState !== 'loading') {
		loaded = true;
		init();
	}
}
onLoad();
if (!loaded) document.addEventListener('readystatechange', onLoad);
})();
