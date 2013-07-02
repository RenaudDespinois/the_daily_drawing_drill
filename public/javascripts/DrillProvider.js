define('DrillProvider', function() {
	var _branches=[], 
		_drill_count=1,
		_max_drills_iteration=5,
		_lang='us';


	/**
	 * Constructor
	 */
	DrillProvider = function (drill_count) {
		if (drill_count)
			_drill_count = drill_count;
		
		var language = $.cookie ('tddd_lang');
		if (language) 
			_lang = language;
	};
	
	/**
	 * Getter for the language
	 */
	DrillProvider.prototype.getLang = function () {
		return _lang;
	}
	
	
	/**
	 * Setter for the branches
	 */
	DrillProvider.prototype.setBranches = function (branches) {
		
		for (var i=0;i<_drill_count;i++) {
			_branches.push(_.cloneDeep(branches));
	
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
				if (myLeaf.suggested_subleaf.display_lcl) {
					myLeaf.suggested_subleaf.display = myLeaf.suggested_subleaf.display_lcl[_lang];
				}
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
				var myLeaves=null;
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
		
		var myFilteredLeaves = $.grep(aLeaves, function (d) { return !d.parent.donotshow });
		
		for (var i=0; i<myFilteredLeaves.length; i++) {
			var myLeaf = myFilteredLeaves[i];
			
			var prefix=null;
			if (myLeaf.parent.prefix_lcl)
				prefix = myLeaf.parent.prefix_lcl[_lang];
			else if (myLeaf.parent.prefix)
				prefix = myLeaf.parent.prefix;
				
			
			//First we push the parent prefix
			if (prefix) {
				myResult.push({
								text: prefix,
								functional: false,
								leaf: myLeaf
							  });
			}
			
			var name=null;
			if (myLeaf.display_lcl)
				name = myLeaf.display_lcl[_lang];
			else if (myLeaf.display)
				name = myLeaf.display;
			else if (myLeaf.name_lcl)
				name = myLeaf.name_lcl[_lang];
			else
				name = myLeaf.name;
			
			//Then we push the leaf text
			myResult.push({
							text: name,
							functional: true,
							leaf: myLeaf
			});
			
			var suffix=null;
			if (myLeaf.parent.suffix_lcl)
				suffix = myLeaf.parent.suffix_lcl[_lang];
			else if (myLeaf.parent.suffix)
				suffix = myLeaf.parent.suffix;
			
			//Then we push the parent suffix
			if (suffix) {
				myResult.push({
								text: suffix,
								functional: false,
								leaf: myLeaf
				  });
			}
			
			if (i==myFilteredLeaves.length-1) {
				myResult[myResult.length-1].text += ".";
			} else if (i!=0){
				myResult[myResult.length-1].text += ", ";
			}
				
		}
			
		return myResult;
	};
	
	return DrillProvider;
});