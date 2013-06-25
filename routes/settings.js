/**
 * GET Settings page
 */

var	mongoose = require('mongoose'),
	Trunk = mongoose.model('Trunk'),
	Branch = mongoose.model('Branch');

exports.settingsGet = function(req, res){
	Trunk.find({
				name: 'Main'
				}, 
				function (err, mytrunks) {
					if (mytrunks && mytrunks.length) {
						Branch.find ({
										id_trunk: mytrunks[0]._id
										},
										null,
										{
											sort: 'order'
										},
										function (err2, mybranches) {
											if (mybranches && mybranches.length) {
												res.render('settings', { branches: JSON.stringify(mybranches)});
											} else {
												res.render('error', { message: 'A Mongoose error has occured.' });
											} 
										})
					} else {
							res.render('error', { message: 'A Mongoose error has occured.' });
					} 
				})
};