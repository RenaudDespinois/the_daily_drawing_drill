require(["DrillProvider"], function (DrillProvider) {
	
	var self = this,
		svg;
	
	self.getSvg = function () {
		svg = svg || d3.select("#page-content").append("svg")
		.attr("width", "1000")
		.attr("height", "1200");
		
		return svg;
	}
	
	self.generateRandomLeaves = function (){
		var branches = $.parseJSON($('#branches').val());
	    
	    var myRndLeaves= new DrillProvider().getRandomLeaves(branches);
	    
	    self.getSvg().selectAll('g.leaf')
	    .data(myRndLeaves).enter().append('g')
	    .attr("class", "leaf")
	    .attr("transform", function(d,i) { 
		      		var myTrans=  "translate(200 "+(50+i*5)+")";
		      		return myTrans;
		      		})
	    .append("text")
	    .attr("transform", function (d,i) {return "translate(100 "+(100+i*40)+")"})
	    .text(function (d) { return d.resultStr});
	}
	
	$("#reload").click(function () {
		self.getSvg().selectAll('g.leaf').remove();
		self.generateRandomLeaves();
	});
	
	$(document).ready(function () {
		self.generateRandomLeaves();
	});
});