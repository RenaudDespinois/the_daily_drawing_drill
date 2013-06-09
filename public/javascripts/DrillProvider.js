define('DrillProvider', function() {
	var _branches;

	/**
	 * 
	 */
	DrillProvider = function (branches) {
		_branches = branches;
	};
	
	/**
	 * 
	 */
	DrillProvider.prototype.setBranches = function (branches) {
		_branches = branches;
	}
	
	/**
	 * 
	 */
	DrillProvider.prototype.getRandomLeaf = function (aBranch) {
		var myLeaf, myTotalWeight = 0;
		
		//First we check if the leaf is locked
		var myLockedBranch = $.grep(aBranch.leaves, function (d) { return d.locked });
		
		if (myLockedBranch && myLockedBranch.length>0) {
			myLeaf = myLockedBranch[0];
		} else {
			for (var i=0; i<aBranch.leaves.length; i++)
				myTotalWeight += aBranch.leaves[i].weight;	
			 
			var myThresh = Math.floor(Math.random()*myTotalWeight);
			
			
			for (var i=0;i<aBranch.leaves.length; i++) {
				myThresh -= aBranch.leaves[i].weight;
			    if ( myThresh < 0 ) {
			    	myLeaf =  aBranch.leaves[i];
			        break;
			    }
			}
		}
		
		return myLeaf;
	};
	
	
	/**
	 * 
	 */
	DrillProvider.prototype.getRandomLeaves = function () {
		var myLeaves = [];
		var myExcludes = [];
		
		for (var i=0; i<_branches.length; i++) {
			var myLeaf;
			do {
				myLeaf = this.getRandomLeaf(_branches[i]);
			} while (myExcludes.indexOf(myLeaf._id)!=-1);
			
			/*
			 * We format the leaf name
			 */
			myLeaf.resultStr = _branches[i].name;
			for (var j=0; j<(20-_branches[i].name.length);j++)
				myLeaf.resultStr += ".";
			myLeaf.parent = _branches[i];
			myLeaf.resultStr += " "+myLeaf.name;
			myLeaves.push (myLeaf);
			myExcludes = myExcludes.concat (myLeaf.excludes);
		}
			
		return myLeaves;
	};
	
	return DrillProvider;
});