define('TrunkManager', function() {
	var _branches=[];

	/**
	 * Constructor
	 */
	TrunkManager = function () {
	};
	
	/**
	 * Setter for the branches
	 */
	TrunkManager.prototype.setBranches = function (branches) {
		_branches = branches;
		for (var i=0;i<_branches.length;i++)
			for (var j=0; j<_branches[i].leaves.length;j++)
				_branches[i].leaves[j].default_weight = _branches[i].leaves[j].weight;
	};
	
	/**
	 * Reset all the branches to their default weight (the one from the DB)
	 */
	TrunkManager.prototype.resetDefaultWeights= function () {
		for (var i=0;i<_branches.length;i++)
			for (var j=0; j<_branches[i].leaves.length;j++)
				_branches[i].leaves[j].weight = _branches[i].leaves[j].default_weight;
	};
	

	/**
	 * Getter for the branches
	 */
	TrunkManager.prototype.getBranches = function () {
		return _branches;
	};
	
	/**
	 * Getter for a branch
	 */
	TrunkManager.prototype.getBranch = function (index) {
		return _branches[index];
	}
	
	/**
	 * Saves the current trunk weights to cookie
	 */
	TrunkManager.prototype.saveToCookie = function () {
		var myStr = "";
		for (var i=0;i<_branches.length;i++)
			for (var j=0; j<_branches[i].leaves.length;j++)
				myStr += _branches[i].leaves[j]._id+"|"+_branches[i].leaves[j].weight+",";
		myStr.substring(0, myStr.length-2);	
		//$.cookie ('tddd_branches', JSON.stringify(_branches), { expires: 7, path: '/' });
		$.cookie ('tddd_branches', myStr, { expires: 7, path: '/' });
		
		myStr = "";
		for (var i=0;i<_branches.length;i++)
			myStr += _branches[i]._id+"|"+_branches[i].donotshow+",";
		myStr.substring(0, myStr.length-2);	
		//$.cookie ('tddd_branches', JSON.stringify(_branches), { expires: 7, path: '/' });
		$.cookie ('tddd_categories', myStr, { expires: 7, path: '/' });
	}
	
	
	/**
	 * Load from the cookie the weights
	 */
	TrunkManager.prototype.loadFromCookie = function () {
		var myCookie = $.cookie ('tddd_branches');
		
		if (myCookie) {
			var myTokens = myCookie.split(",");
			var myMap = {};
			myTokens.forEach (function (d) { 
				var couple = d.split("|");
				myMap[couple[0]]=couple[1];
			})
			for (var i=0;i<_branches.length;i++)
				for (var j=0; j<_branches[i].leaves.length;j++) {
					var myWeight = myMap[_branches[i].leaves[j]._id];
					if (myWeight && myWeight>0)
						_branches[i].leaves[j].weight = parseFloat(myWeight);
				}
		}
		
		myCookie = $.cookie ('tddd_categories');
		
		if (myCookie) {
			var myTokens = myCookie.split(",");
			var myMap = {};
			myTokens.forEach (function (d) { 
				var couple = d.split("|");
				myMap[couple[0]]=couple[1];
			})
			for (var i=0;i<_branches.length;i++) {
				var donotshow = myMap[_branches[i]._id];
				if (donotshow)
					_branches[i].donotshow = (donotshow==="true");
			}
				
		}
		
		
	}
	
	return TrunkManager;
});