require(["DrillProvider"], function (DrillProvider) {
	
	var self = this,
		svg,
		branches,
		drillProvider = new DrillProvider();
	
	
	self.clickLeaf = function (d,i) {
		d.locked = !d.locked;
		
		if (d.locked) {
			d3.selectAll ("g.leaf")
				.filter(function (e) { return e._id==d._id; })
				.append ("image")
				.attr("xlink:href", "./images/lock.png")
			    .attr("width", 23)
			    .attr("height", 32)
			    .attr("x", -13)
			    .attr("y", -41);
		} else { 
			d3.selectAll ("g.leaf image")
				.filter(function (e) { return e._id==d._id; })
				.remove();
		}
	}
	
	self.getSvg = function () {
		svg = svg || d3.select("#page-content").append("svg")
		.attr("width", "1000")
		.attr("height", "1200");
		
		return svg;
	}
	
	self.generateRandomLeaves = function (){
		var myRndLeaves= drillProvider.getRandomLeaves();
	    
	    self.getSvg().selectAll('g.leaf')
	    .data(myRndLeaves).enter().append('g')
	    .attr("class", "leaf")
	    .attr("transform", function(d,i) { 
		      		var myTrans=  "translate(310 "+(150+i*45)+")";
		      		return myTrans;
		      		})
		.on("click", self.clickLeaf)
	    .append("text")
	    .text(function (d) { return d.resultStr});
	}
	
	self.updateRandomLeaves = function (){
	    var myRndLeaves= drillProvider.getRandomLeaves();
	    
	    var myNewLeaves = self.getSvg().selectAll('g.leaf')
	    .data(myRndLeaves);
	    
	    myNewLeaves.select("text")
	    .text(function (d) { return d.resultStr});
	    
	    myNewLeaves.exit().remove();
	}
	
	$("#reload").click(function () {
		self.updateRandomLeaves();
	});
	
	$(document).ready(function () {
		drillProvider.setBranches($.parseJSON($('#branches').val()));
		self.generateRandomLeaves();
	});
});