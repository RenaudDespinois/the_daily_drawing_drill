require(["DrillProvider"], function (DrillProvider) {
	
	var self = this,
		svg,
		branches,
		drillProvider = new DrillProvider(7),
		svg_width=1000,
		svg_height=200,
		default_x=20,
		default_y=66,
		max_width=335,
		line_spacing=35,
		lock_dx=-10,
		lock_dy=-33,
		days_of_week = ['Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday','Sunday'],
		current_day=0,
		offscreen_decal_x=500;
	
	
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
		.attr("height", svg_height)
		.append("g")
		.attr("transform", "translate(0,10)");
		
		return svg;
	}
	
	self.generateRandomLeaves = function (){
		var weeklyDrills = drillProvider.getRandomDrills();
		
		for (var i=0;i<weeklyDrills.length;i++) {
			
			var myCanvas = self.getSvg().append("g")
										.attr("class", "container")
										.attr("id", "drill-"+i)
										.attr("transform", "translate("+(i*offscreen_decal_x)+" "+0+")");
			
			myCanvas.append("text")
			.attr("x", 254)
			.attr("y", 7)
			.style("text-anchor", "middle")
			.attr("class","day")
			.text(days_of_week[i]);
		
			var myRndLeaves= drillProvider.getFormattedDrill(weeklyDrills[i]);
	    
		self.current_x=default_x;
		self.current_y=default_y;
		self.lastLeaf = myRndLeaves[0].leaf._id;
		
			myCanvas.selectAll('g.leaf')
	    .data(myRndLeaves).enter().append('g')
	    .attr("class", function (d) {return d.functional?"leaf":null})
		.on("click", self.clickLeaf)
	    .append("text")
	    .text(function (d) { return d.text})
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
		}
	}
	
	self.updateRandomLeaves = function (for_day){
		var weeklyDrills = drillProvider.getRandomDrills(for_day?current_day:null);
		
		for (var i=for_day?current_day:0;i<(for_day?(current_day+1):weeklyDrills.length);i++) {
			
			var myCanvas = self.getSvg().select ("g#drill-"+i);
			
			var myRndLeaves= drillProvider.getFormattedDrill(weeklyDrills[for_day?0:i]);
	    
		    self.current_x=default_x;
			self.current_y=default_y;
			self.lastLeaf = myRndLeaves[0].leaf._id;
		    
		    var myNewLeaves = myCanvas.selectAll('g')
		    .data(myRndLeaves);
		    
		    myNewLeaves.select("text")
		    .text(function (d) { return d.text})
		    .transition()
		    .attr("transform", function(d) { 
		    	
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
	}
	
	
	$("#lock_free").click(function () {
		self.freeLocks();
	});
	
	$("#reload").click(function () {
		self.updateRandomLeaves(false);
		current_day=0;
		d3.select("#previous").style("display", "none");
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});

	});
	
	$("#reload_day").click(function () {
		self.updateRandomLeaves(true);
	});
	
	$("#previous").click(function () {
		current_day--;
		if (current_day==0){
			d3.select("#previous").style("display", "none");
		}
		d3.select("#next").style("display", "block");
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});
	});
	
	$("#next").click(function () {
		current_day++;
		if (current_day==6){
			d3.select("#next").style("display", "none");
		} 
		d3.select("#previous").style("display", "block");
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});
	});
	
	$(document).ready(function () {
		drillProvider.setBranches($.parseJSON($('#branches').val()));
		self.generateRandomLeaves();
	});
});