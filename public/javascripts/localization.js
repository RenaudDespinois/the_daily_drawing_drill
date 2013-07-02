function setLocale (myLocale) {
	$.cookie ('tddd_lang', myLocale, { expires: 7, path: '/' });
	document.location.reload(true);
}