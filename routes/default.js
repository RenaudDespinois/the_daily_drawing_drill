/**
 * GET page "destination"
 */


exports.defaultGet = function(req, res, destination){
	res.render(destination);
};