require(["DrillProvider", "TrunkManager"], function (DrillProvider, TrunkManager) {
	
	var self = this,
		svg,
		branches,
		drillProvider = new DrillProvider(7),
		trunkManager = new TrunkManager(),
		svg_width=1300,
		svg_height=200,
		default_x=20,
		default_y=61,
		max_width=335,
		line_spacing=35,
		lock_dx=-10,
		lock_dy=-33,
		bulb_dx=-4,
		bulb_dy=-30,
		days_of_week = ['Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday','Sunday'],
		current_day=0,
		offscreen_decal_x=600;
	
	/**
	 * Getter for the main SVG canvas
	 */
	self.getSvg = function () {
		svg = svg || d3.select("#svg-container").append("svg")
		.attr("width", svg_width)
		.attr("height", svg_height)
		.append("g")
		.attr("transform", "translate(0,10)");

		return svg;
	}
	
	/**
	 * Exports the current weekly drill to Pdf using JSPdf
	 */
	self.exportToPdf = function () {
		var doc = new jsPDF();
		var imgData = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjUzMjkzQjVEMzc3MTFFMkI4MkVGMDY5RUZCNTU4OTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjUzMjkzQjZEMzc3MTFFMkI4MkVGMDY5RUZCNTU4OTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNTMyOTNCM0QzNzcxMUUyQjgyRUYwNjlFRkI1NTg5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNTMyOTNCNEQzNzcxMUUyQjgyRUYwNjlFRkI1NTg5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAYEBAQFBAYFBQYJBgUGCQsI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';
		doc.addImage(imgData, 'JPEG', 40, 5, 130, 30);
		doc.setFont("helvetica");
		
		for (var i=0; i< days_of_week.length;i++) {
			var curY = 50+i*34;
			
			doc.line(65, curY-8, 145, curY-8);
			//doc.setTextColor(224,98,132);
			doc.setFontSize(16);
			doc.setFontType("italic");
			doc.text(20, curY, days_of_week[i]);
			doc.setFontSize(10);
			var myGroup = self.getSvg().selectAll ("g#drill-"+i+" g");
			
			self.current_x=20;
    		self.current_y=curY+8;
			
			myGroup.each ( function (d) { 
				
				if (d.functional) {
					doc.setTextColor(69, 91, 161);
					doc.setFontType("bold");
				} else {
					doc.setTextColor(0,0,0);
					doc.setFontType("normal");
				}
				var myText = d.text, 
					myHint =(d.functional && d.leaf.suggested_subleaf)?(" (hint: "+d.leaf.suggested_subleaf.display.toLowerCase()+")"):"";
				
				
				doc.text(self.current_x,self.current_y,myText);
				
				var step = d.functional?(myText.length*1.7+4):(myText.length*1.58+4);
				
	    		if (self.current_x+step>160) {
	    			self.current_x=20;
		    		self.current_y+=6;
	    		} else {
	    			self.current_x +=step;
	    		}
	    		
	    		if (myHint) {
	    			doc.setTextColor(0,0,0);
					doc.setFontType("normal");
					doc.text(self.current_x,self.current_y,myHint);
					
					var step = myHint.length*1.55;
					
		    		if (self.current_x+step>160) {
		    			self.current_x=20;
			    		self.current_y+=6;
		    		} else {
		    			self.current_x +=step;
		    		}

	    		}
			});
		}
		doc.save("weekly-drill.pdf");
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
					.attr("class", "lock")
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
	 * Generates and displays the drills
	 */
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
			
			var mySvgLeaves =	myCanvas.selectAll('g.leaf')
		    .data(myRndLeaves).enter().append('g')
		    .attr("class", function (d) {return d.functional?"leaf":null})
			.on("click", self.clickLeaf);
			
			//Create the text
			mySvgLeaves.append("text")
			.attr("class", function (d) {return d.functional?"leaf_text":null})
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
	}
	
	/**
	 * Updates and displays the new leaves: only for the current day or for the whole week
	 * @param for_day boolean that indicates if it has to be only for the current day or for the whole week
	 */
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
	  		
	  		myNewLeaves.select("image.bulb")
  		.attr("class",function (d) { 
  			return (d.functional && d.leaf.suggested_subleaf)?"bulb subleaf":"bulb invisible";
  			})
	    .transition()
	    .attr("x", function (d) { 
	    	return this.parentNode.childNodes[0].getBBox().width+d.x+bulb_dx;
	    	})
	    .attr("y", function (d) { return d.y+bulb_dy});
	  		
	  		myNewLeaves.select ("image.lock")
	  		.transition()
	  		.attr("x", function (d) { return d.x+lock_dx})
					    .attr("y", function (d) { return d.y+lock_dy});
	  		
		    
		    
		    myNewLeaves.exit().remove();
		}
	}
	
	/**
	 * Reload the whole week and regenerate the drills
	 */
	self.reload = function () {
		self.freeLocks();
		self.updateRandomLeaves(false);
		current_day=0;
		d3.select("#previous").style("display", "none");
		d3.select("#next").style("display", "block");
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});
	}
	
	/**
	 * Move to the previous day
	 */
	self.clickPreviousDay = function () {
		current_day--;
		if (current_day==0){
			d3.select("#previous").style("display", "none");
		}
		d3.select("#next").style("display", "block");
		self.killAlert();
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});

	}
	
	/**
	 * Move to the next day
	 */
	self.clickNextDay = function () {
		current_day++;
		if (current_day==6){
			d3.select("#next").style("display", "none");
		} 
		d3.select("#previous").style("display", "block");
		self.killAlert();
		self.getSvg().selectAll("g.container").transition().attr("transform", function (d,i) { return "translate("+((i-current_day)*offscreen_decal_x)+" 0)";});
	}
	
	//------------------------------------
	// Javascript buttons behaviors
	//------------------------------------
	
	$("#export").click(function () {
		self.exportToPdf();
	});
	
	
	$("#lock_free").click(function () {
		self.freeLocks();
	});
	
	$("#reload").click(function () {
		self.reload();
	});
	
	$("#reload_day").click(function () {
		self.updateRandomLeaves(true);
	});
	
	$("#previous").click(function () {
		self.clickPreviousDay();
	});
	
	$("#next").click(function () {
		self.clickNextDay();
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