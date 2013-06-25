require(["DrillProvider", "TrunkManager"], function (DrillProvider, TrunkManager) {
	
	var self = this,
		svg,
		branches,
		drillProvider = new DrillProvider(),
		trunkManager = new TrunkManager(),
		svg_width=1300,
		svg_height=185,
		default_x=20,
		default_y=40,
		max_width=335,
		line_spacing=35,
		lock_dx=-10,
		lock_dy=-33,
		bulb_dx=-4,
		bulb_dy=-30;
	
	/**
	 * Getter for the main SVG canvas
	 */
	self.getSvg = function () {
		svg = svg || d3.select("#svg-container").append("svg")
		.attr("width", svg_width)
		.attr("height", svg_height);
		
		return svg;
	}
	
	/**
	 * Delete all present locks
	 */
	self.freeLocks = function () {
		self.getSvg().selectAll("g.leaf").each(function (d) { d.leaf.locked=false; });
		self.getSvg().selectAll ("g.leaf image.lock").remove();
	}
	
	/**
	 * Click on a leaf : lock the leaf
	 */
	self.clickLeaf = function (d,i) {
		if (d.functional) {
			d.leaf.locked = !d.leaf.locked;
			
			if (d.leaf.locked) {
				d3.select (this)
					.append ("image")
					.attr("class","lock")
					.attr("xlink:href", "./images/lock.png")
				    .attr("width", 18)
				    .attr("height", 25)
				    .attr("x", function (d) { return d.x+lock_dx})
				    .attr("y", function (d) { return d.y+lock_dy});
			} else { 
				d3.selectAll ("g.leaf image.lock")
					.filter(function (e) { return e.leaf._id==d.leaf._id; })
					.remove();
			}
		}
	}
	
	
	/**
	 * Generates the hint popup on a category
	 */
	self.generateAlert = function (x, y, label){
		
		var myAlert = self.getSvg().append("g").attr("class","alert").attr("transform", "translate("+(x-140)+","+(y+25)+")");
		myAlert.append("rect")
		.attr("width", 300)
		.attr("height", 40)
		.attr("fill", "white")
		.style("stroke", "#455ba1")
		.style("fill-opacity",0.9);
		
		myAlert.append("text")
		.attr("x", 150)
		.attr("y", 24)
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.style("opacity",1)
		.style("font-size", "11px")
		.text(label);
		
	}
	
	/**
	 * Hides the hint popup
	 */
	self.killAlert = function () {
		d3.select("g.alert").transition().delay(100).style("opacity",0).each ("end", function() {d3.select("g.alert").remove();});
	}
	
	/**
	 * Generates and displays the drill
	 */
	self.generateRandomLeaves = function (){
		var myRndLeaves= drillProvider.getFormattedDrill(drillProvider.getRandomDrills()[0]);
	    
		self.current_x=default_x;
		self.current_y=default_y;
		self.lastLeaf = myRndLeaves[0].leaf._id;
		
	    var mySvgLeaves = self.getSvg().selectAll('g.leaf')
	    .data(myRndLeaves).enter().append('g')
	    .attr("class", function (d) {return d.functional?"leaf":null})
		.on("click", self.clickLeaf);
	    
	    
	    //Create the text
	    mySvgLeaves.append("text")
	    .text(function (d) { return d.text})
	    .attr("class", function (d) {return d.functional?"leaf_text":null})
	    .attr("transform", function(d,i) { 
	    	var currentLeaf = d.leaf._id;
	    	d.x=self.current_x;
		    d.y=self.current_y;
		      		var myTrans=  "translate("+self.current_x+" "+self.current_y+")";
		      		var currentLeaf = d.leaf._id;
			    	var step = this.getBBox().width+5;

			    		if (self.current_x+step>default_x+max_width) {
			    			self.current_x=default_x;
				    		self.current_y+=line_spacing;
			    		} else {
			    			self.current_x +=step;
			    		}
			    
	    	return myTrans;
  		});
  		
	    //Create the hint if needed
  		mySvgLeaves.append("image")
  		.attr("class",function (d) { 
  			return (d.functional && d.leaf.suggested_subleaf)?"bulb subleaf":"bulb invisible";
  			})
		.attr("xlink:href", "./images/bulb.png")
	    .attr("width", 18)
	    .attr("height", 25)
	    .attr("x", function (d) { 
	    	return this.parentNode.childNodes[0].getBBox().width+d.x+bulb_dx;
	    	})
	    .attr("y", function (d) { return d.y+bulb_dy})
	    .on ("mouseover", function (d) { 
	    	if (d.functional && d.leaf.suggested_subleaf) {
	    		var  comp = d3.select(this);
	    			self.generateAlert(parseFloat(comp.attr("x")),parseFloat(comp.attr("y")),d.leaf.suggested_subleaf.display);
	    	}
	    })
	    .on ("mouseout", function (d) { 
	    	if (d.functional && d.leaf.suggested_subleaf) {
	    			self.killAlert();
	    	}
	    })
	}
	
	/**
	 * Updates and displays the new leaves
	 */
	self.updateRandomLeaves = function (){
	    var myRndLeaves= drillProvider.getFormattedDrill(drillProvider.getRandomDrills()[0]);
	    
	    self.current_x=default_x;
		self.current_y=default_y;
		self.lastLeaf = myRndLeaves[0].leaf._id;
	    
	    var myNewLeaves = self.getSvg().selectAll('g')
	    .data(myRndLeaves);
	    
	    
	    //Updates the text
	    myNewLeaves.select("text")
	    .text(function (d) { return d.text})
	    .transition()
	    .attr("transform", function(d,i) { 
	    	var currentLeaf = d.leaf._id;
	    	d.x=self.current_x;
		    d.y=self.current_y;
		      		var myTrans=  "translate("+self.current_x+" "+self.current_y+")";
		      		var currentLeaf = d.leaf._id;
			    	var step = this.getBBox().width+5;

			    		if (self.current_x+step>default_x+max_width) {
			    			self.current_x=default_x;
				    		self.current_y+=line_spacing;
			    		} else {
			    			self.current_x +=step;
			    		}
	    	
	    	return myTrans;
  		})
  		
  		//Update the hint if needed
  		myNewLeaves.select("image.bulb")
  		.attr("class",function (d) { 
  			return (d.functional && d.leaf.suggested_subleaf)?"bulb subleaf":"bulb invisible";
  			})
	    .transition()
	    .attr("x", function (d) { 
	    	return this.parentNode.childNodes[0].getBBox().width+d.x+bulb_dx;
	    	})
	    .attr("y", function (d) { return d.y+bulb_dy});
  		
	    //Update the lock if needed
  		myNewLeaves.select ("image.lock")
  		.transition()
  		.attr("x", function (d) { return d.x+lock_dx})
				    .attr("y", function (d) { return d.y+lock_dy});
  		
	    
	    
	    myNewLeaves.exit().remove();
	}
	
	//------------------------------------
	// Javascript buttons behaviors
	//------------------------------------
	
	$("#lock_free").click(function () {
		self.freeLocks();
	});
	
	$("#reload").click(function () {
		self.updateRandomLeaves();
	});
	
	//------------------------------------
	// Loading of the page
	//------------------------------------
	
	$(document).ready(function () {
		trunkManager.setBranches($.parseJSON($('#branches').val()));
		trunkManager.loadFromCookie();
		drillProvider.setBranches(trunkManager.getBranches());
		self.generateRandomLeaves();
	});
});