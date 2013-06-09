define('DrillProvider', function() {

	/**
	 * 
	 */
	DrillProvider = function () {
	};
	
	/**
	 * 
	 */
	DrillProvider.prototype.getRandomLeaf = function (aBranch) {
		var myTotalWeight = 0;
		
		for (var i=0; i<aBranch.leaves.length; i++)
			myTotalWeight += aBranch.leaves[i].weight;	
		 
		var myThresh = Math.floor(Math.random()*myTotalWeight);
		var myLeaf;
		
		for (var i=0;i<aBranch.leaves.length; i++) {
			myThresh -= aBranch.leaves[i].weight;
		    if ( myThresh < 0 ) {
		    	myLeaf =  aBranch.leaves[i];
		        break;
		    }
		}
		
		return myLeaf;
	};
	
	
	/**
	 * 
	 */
	DrillProvider.prototype.getRandomLeaves = function (aBranches) {
		var myLeaves = [];
		var myExcludes = [];
		
		for (var i=0; i<aBranches.length; i++) {
			var myLeaf;
			do {
				myLeaf = this.getRandomLeaf(aBranches[i]);
			} while (myExcludes.indexOf(myLeaf._id)!=-1);
			
			/*
			 * We format the leaf name
			 */
			myLeaf.resultStr = aBranches[i].name;
			for (var j=0; j<(20-aBranches[i].name.length);j++)
				myLeaf.resultStr += ".";
			myLeaf.resultStr += " "+myLeaf.name;
			myLeaves.push (myLeaf);
			myLeaves = myLeaves.concat (myLeaf.excludes);
		}
			
		return myLeaves;
	};
	
	return DrillProvider;
});