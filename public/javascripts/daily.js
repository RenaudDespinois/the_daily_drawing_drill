require(["DrillProvider"], function (DrillProvider) {
	
	var self = this,
		svg,
		branches,
		drillProvider = new DrillProvider(),
		svg_width=1000,
		svg_height=185,
		default_x=20,
		default_y=40,
		max_width=335,
		line_spacing=35,
		lock_dx=-10,
		lock_dy=-33;
	
	self.freeLocks = function () {
		self.getSvg().selectAll("g.leaf").each(function (d) { d.leaf.locked=false; });
		self.getSvg().selectAll ("g.leaf image").remove();
	}
	
	self.clickLeaf = function (d,i) {
		if (d.functional) {
			d.leaf.locked = !d.leaf.locked;
			
			if (d.leaf.locked) {
				d3.select (this)
					.append ("image")
					.attr("xlink:href", "./images/lock.png")
				    .attr("width", 18)
				    .attr("height", 25)
				    .attr("x", function (d) { return d.x+lock_dx})
				    .attr("y", function (d) { return d.y+lock_dy});
			} else { 
				d3.selectAll ("g.leaf image")
					.filter(function (e) { return e.leaf._id==d.leaf._id; })
					.remove();
			}
		}
	}
	
	self.getSvg = function () {
		svg = svg || d3.select("#svg-container").append("svg")
		.attr("width", svg_width)
		.attr("height", svg_height);
		
		return svg;
	}
	
	self.generateRandomLeaves = function (){
		var myRndLeaves= drillProvider.getFormattedDrill(drillProvider.getRandomDrills()[0]);
	    
		self.current_x=default_x;
		self.current_y=default_y;
		self.lastLeaf = myRndLeaves[0].leaf._id;
		
	    self.getSvg().selectAll('g.leaf')
	    .data(myRndLeaves).enter().append('g')
	    .attr("class", function (d) {return d.functional?"leaf":null})
		.on("click", self.clickLeaf)
	    .append("text")
	    .text(function (d) { return d.text})
	    .attr("transform", function(d,i) { 
	    	var currentLeaf = d.leaf._id;
	    	/*
	    	if (currentLeaf!=self.lastLeaf) {
	    		self.lastLeaf = currentLeaf;
	    		self.current_x=310;
	    		self.current_y+=45;
	    	}*/
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
	}
	
	self.updateRandomLeaves = function (){
	    var myRndLeaves= drillProvider.getFormattedDrill(drillProvider.getRandomDrills()[0]);
	    
	    self.current_x=default_x;
		self.current_y=default_y;
		self.lastLeaf = myRndLeaves[0].leaf._id;
	    
	    var myNewLeaves = self.getSvg().selectAll('g')
	    .data(myRndLeaves);
	    
	    myNewLeaves.select("text")
	    .text(function (d) { return d.text})
	    .transition()
	    .attr("transform", function(d,i) { 
	    	var currentLeaf = d.leaf._id;
	    	/*
	    	if (currentLeaf!=self.lastLeaf) {
	    		self.lastLeaf = currentLeaf;
	    		self.current_x=310;
	    		self.current_y+=45;
	    	}*/
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
  		
  		myNewLeaves.select ("image")
  		.transition()
  		.attr("x", function (d) { return d.x+lock_dx})
				    .attr("y", function (d) { return d.y+lock_dy});
  		
	    
	    
	    myNewLeaves.exit().remove();
	}
	
	$("#lock_free").click(function () {
		self.freeLocks();
	});
	
	$("#reload").click(function () {
		self.updateRandomLeaves();
	});
	
	$(document).ready(function () {
		drillProvider.setBranches($.parseJSON($('#branches').val()));
		self.generateRandomLeaves();
	});
});