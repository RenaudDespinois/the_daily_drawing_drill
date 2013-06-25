define('DrillProvider', function() {
	var _branches=[], 
		_drill_count=1,
		_max_drills_iteration=5;


	/**
	 * Constructor
	 */
	DrillProvider = function (drill_count) {
		if (drill_count)
			_drill_count = drill_count;
	};
	
	/**
	 * Setter for the branches
	 */
	DrillProvider.prototype.setBranches = function (branches) {
		
		for (var i=0;i<_drill_count;i++) {
			_branches.push(branches);
	
			//We put the parent at the leaf level
			for (var j=0;j<_branches[i].length;j++) {
				var myBranch = _branches[i][j];
				if (myBranch.leaves) {
					for (var k=0;k<myBranch.leaves.length;k++)
						myBranch.leaves[k].parent = myBranch;
				}
			}
		}
	}
	
	/**
	 * Function that randomly choose one item from a collection of weighted items (need the 'weight' attribute)
	 */
	DrillProvider.prototype.getRandomWeightedItem = function (aCollection) {
		var myItem,myTotalWeight = 0;
		
		for (var i=0; i<aCollection.length; i++)
			myTotalWeight += aCollection[i].weight;	
		 
		var myThresh = Math.floor(Math.random()*myTotalWeight);
		
		
		for (var i=0;i<aCollection.length; i++) {
			myThresh -= aCollection[i].weight;
		    if ( myThresh < 0 ) {
		    	myItem =  aCollection[i];
		        break;
		    }
		}
		return myItem;
	}
	
	/**
	 * Get a random leaf from the branch
	 */
	DrillProvider.prototype.getRandomLeaf = function (aBranch) {
		var myLeaf;
		
		//First we check if the leaf is locked
		var myLockedBranch = $.grep(aBranch.leaves, function (d) { return d.locked });
		
		if (myLockedBranch && myLockedBranch.length>0) {
			myLeaf = myLockedBranch[0];
		} else {
			myLeaf = this.getRandomWeightedItem (aBranch.leaves);
			
			if (myLeaf.subleaves && myLeaf.subleaves.length>0) {
				myLeaf.suggested_subleaf = this.getRandomWeightedItem (myLeaf.subleaves);
			}
		}
		
		return myLeaf;
	};
	
	/**
	 * Tells if a drill is consistent, ie if a collection of leaves respects the excludes of each leaf
	 */
	DrillProvider.prototype.isDrillConsistent = function (aLeaves) {
		var ids=[], excludes=[];
		
		// We go through all the leaves and get ids and excludes
		aLeaves.forEach (function (d) {
			ids.push(d._id);
			if (d.excludes) {
				excludes = excludes.concat(d.excludes);
			}
		})
		
		//Then we get the intersection
		var intersect = _.intersection(ids, _.uniq(excludes));
		
		
		return !intersect || !intersect.length;
	};
	
	
	/**
	 * Generate one or various drills
	 */
	DrillProvider.prototype.getRandomDrills = function (fixed_index) {
		var myResult = [];
		
		var start = !(typeof fixed_index == 'undefined' || fixed_index===null)?fixed_index:0,
			stop = !(typeof fixed_index == 'undefined' || fixed_index===null)?fixed_index+1:_drill_count;

		for (var i=start;i<stop;i++) {
			var currentThreshold=0, currentIteration=0;
			do {
				currentIteration++;
				var myLeaves;
				do {
					myLeaves = [];
					for (var j=0; j<_branches[i].length; j++) 
						myLeaves.push (this.getRandomLeaf(_branches[i][j]));
				} while (!this.isDrillConsistent(myLeaves));
				
			} while (!this.isDistanceAcceptable(myResult, myLeaves, currentThreshold) && ((currentIteration<=_max_drills_iteration) || ((currentIteration=0) || ++currentThreshold)))
			myResult.push(myLeaves);
		}
			
		return myResult;
	};
	
	
	
	/**
	 * Function that indicates if the differences between a drill and a set of past drills is enough to consider it "different"
	 */
	DrillProvider.prototype.isDistanceAcceptable = function (pastResult, currentResult, threshold) {
		// We go through all the results and get ids 
		var ids = [], currentIds = [];
		for (var i=0;i<pastResult.length;i++)	
			pastResult[i].forEach (function (d) { ids.push(d._id);});
		currentResult.forEach (function (d) { currentIds.push(d._id);});
		
		//Then we get the intersection
		var intersect = _.intersection(_.uniq(ids), _.uniq(currentIds));
		
		return (!intersect || intersect.length<=threshold);
	}
	
		
	/**
	 * Formats a drill for display
	 */
	DrillProvider.prototype.getFormattedDrill = function (aLeaves) {
		var myResult = [];
		
		for (var i=0; i<aLeaves.length; i++) {
			var myLeaf = aLeaves[i];
			
			//First we push the parent prefix
			if (myLeaf.parent.prefix && myLeaf.parent.prefix.length>0) {
				myResult.push({
								text: myLeaf.parent.prefix,
								functional: false,
								leaf: myLeaf
							  });
			}
			
			//Then we push the leaf text
			myResult.push({
							text: myLeaf.display?myLeaf.display:myLeaf.name,
							functional: true,
							leaf: myLeaf
			});
			
			//Then we push the parent suffix
			if (myLeaf.parent.suffix && myLeaf.parent.suffix.length>0) {
				myResult.push({
								text: myLeaf.parent.suffix,
								functional: false,
								leaf: myLeaf
				  });
			}
		}
			
		return myResult;
	};
	
	return DrillProvider;
});