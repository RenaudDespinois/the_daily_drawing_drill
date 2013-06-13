define('DrillProvider', function() {
	var _branches=[], _drill_count=1;


	/**
	 * 
	 */
	DrillProvider = function (drill_count) {
		if (drill_count)
			_drill_count = drill_count;
	};
	
	/**
	 * 
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
	 * 
	 */
	DrillProvider.prototype.getRandomDrills = function (fixed_index) {
		var myResult = [];
		
		var start = fixed_index?fixed_index:0,
			stop = fixed_index?fixed_index+1:_drill_count;

		for (var i=start;i<stop;i++) {
			var myLeaves;
			do {
				myLeaves = [];
				for (var j=0; j<_branches[i].length; j++) 
					myLeaves.push (this.getRandomLeaf(_branches[i][j]));
			} while (!this.isDrillConsistent(myLeaves));
			myResult.push(myLeaves);
		}
			
		return myResult;
	};
	
		
	/**
	 * 
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