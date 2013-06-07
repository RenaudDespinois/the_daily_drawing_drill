/**
 * ------------------------------------------------
 * model.js : Defines the data model and exports it
 * ------------------------------------------------
 */

var db = require('./config/db');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var Trunk = new Schema({
	_id		: ObjectId,
	name	: String
});

var Branch = new Schema({
	_id		: ObjectId,
	name	: String,
	id_trunk: ObjectId,
	order	: Number,
	leaves	: [{
	      	   _id		: ObjectId,
	      	   name		: String,
	      	   weight	: Number,
	      	   excludes	: [ObjectId]
			 }]
});
 
mongoose.connect('mongodb://' + db.user + ':' + db.pass + '@' + db.host + ':' + db.port + '/' + db.name);
mongoose.model('Trunk', Trunk);
mongoose.model('Branch', Branch);