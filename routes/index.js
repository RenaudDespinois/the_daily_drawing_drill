/**
 * GET Homepage
 */

var	mongoose = require('mongoose'),
	Trunk = mongoose.model('Trunk'),
	Branch = mongoose.model('Branch');

exports.indexGet = function(req, res, drillProvider){
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
												res.render('index', { branches: drillProvider.getRandomLeaves(mybranches)});
											} else {
												res.render('index', { title: 'ERROR' });
											} 
										})
					} else {
							res.render('index', { title: 'ERROR' });
					} 
				})
};