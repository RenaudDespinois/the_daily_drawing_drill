/**
 * GET page "destination"
 */


exports.defaultGet = function(req, res, destination, language){
	res.render(language+'/'+destination, { locale: language});
};