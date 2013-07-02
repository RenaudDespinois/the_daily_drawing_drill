require(["TrunkManager"], function (TrunkManager) {
	
	var self = this,
		svg,
		trunkManager = new TrunkManager(),
		svg_width=1100,
		svg_height=600,
		svg_x=170,
		svg_y=200,
		arc_padding=5,
		arc_inner_radius=120,
		arc_outer_radius=150,
		arc_outer_text_radius = 158,
		arc_center_radius= (arc_inner_radius+(arc_outer_radius-arc_inner_radius)/2),
		slider_radius = 12,
		angular_coef_char=2.2,
		settings_str = {
						'us': "Settings have been saved.",
						'fr': "Configuration sauvegardée.",
						'es': "Ajustes guardados."
		},
		donotshow_str = {
				'us': "Do not show category",
				'fr': "Ne pas afficher catégorie",
				'es': "Esconder categoría"
}
		;
	
	self.colors = d3.scale.ordinal().range(["rgb(158,1,66)",
	                                        "rgb(213,62,79)",
	                                        "rgb(244,109,67)",
	                                        "rgb(253,174,97)",
	                                        "rgb(254,224,139)",
	                                        "rgb(255,255,191)",
	                                        "rgb(230,245,152)",
	                                        "rgb(171,221,164)",
	                                        "rgb(107,189,99)",
	                                        "rgb(54,149,142)",
	                                        "rgb(50,136,189)",
	                                        "rgb(33,99,173)",
	                                        "rgb(94,79,162)",
	                                        "rgb(85,38,138)",
	                                        "rgb(177,26,40)",
	                                        "rgb(104,14,32)"]);
	
	self.language='us';
	self.current_branch=0;
	
	/**
	 * Getter for the SVG canvas
	 */
	self.getSvg = function () {
		svg = svg || d3.select("#svg-container").append("svg")
		.attr("width", svg_width)
		.attr("height", svg_height)
		.append("g")
		.attr("transform", "translate ("+svg_x+","+svg_y+")");
		
		return svg;
	}
	
	
	/**
	 * Gets the trimmed text depending on the angular sector it's displayed on
	 */
	self.getAutoTrimmedText = function (d) {
		var sector = d.end_angle-d.start_angle;
		var max_chars = Math.round(sector/angular_coef_char);
		var myResult = "";
		
		if (max_chars>4) {
			myResult = d.name_lcl?d.name_lcl[self.language]:d.name;
			if (myResult.length>max_chars) {
				myResult = myResult.substring(0,max_chars-4)+"...";
			}
		}
		
		return myResult;
	}
	
	/**
	 * Returns the radiant angle from the degree angle
	 * 
	 * @param {Object} angle
	 */
	self.degToRad = function(angle){
		return angle/ 180 * Math.PI;
	};
	
	/**
	 * Returns the degree angle from the radiant angle
	 * 
	 * @param {Object} angle
	 */
	self.radToDeg = function(angle){
		return angle* 180 / Math.PI;
	};
	
	/**
	 * Ends the drag of a slider : update the legend
	 */
	self.endDrag = function () {
		var mySlider = self.moving_slider.__data__;
		mySlider.angle_old = mySlider.angle;
		
		document.onmousemove = null;
        document.onmouseup = null;
        self.moving_slider = null;
        
        self.getSvg().selectAll("g.legend").sort(function (a,b) { return b.pct-a.pct})
		.transition()
		.duration (200)
		.attr("transform", function (d,i) { return "translate(0,"+(i*25)+")"});
        
        return false;
	}
	
	/**
	 * Starts the drag of a slider and update the donut
	 */
	self.dragSlider = function (event) {
		 var thumbPos = {
                 left : event.pageX - $('#svg-container').offset().left -svg_x
             ,   top  : event.pageY - $('#svg-container').offset().top -svg_y
         };
		 
		 
		 
		 var mySlider = self.moving_slider.__data__;

		 var angle = 90+self.radToDeg( Math.atan2( thumbPos.top, thumbPos.left ) );
		 angle = (angle>360)?(angle-360):(angle<0?(angle+360):angle);
		 
		 if (angle>=(mySlider.leaf_from.start_angle+arc_padding/2) && angle<=(mySlider.leaf_to.end_angle-+arc_padding/2)) {
		 
		 mySlider.angle = angle;

		 mySlider.x = Math.cos (self.degToRad(angle-90)) * arc_center_radius - slider_radius;
		 mySlider.y = Math.sin (self.degToRad(angle-90)) * arc_center_radius -slider_radius;
		 
		 mySlider.leaf_from.end_angle = angle-arc_padding/2; 
		 mySlider.leaf_to.start_angle = angle+arc_padding/2;
		 
		 //Change the from leaf
		 mySlider.leaf_from.weight = (mySlider.leaf_from.end_angle-mySlider.leaf_from.start_angle)/self.angle_total*self.weight_total;
		 mySlider.leaf_from.pct = Math.round(mySlider.leaf_from.weight/self.weight_total*100);
		//Change the to leaf
		 mySlider.leaf_to.weight = (mySlider.leaf_to.end_angle-mySlider.leaf_to.start_angle)/self.angle_total*self.weight_total;
		 mySlider.leaf_to.pct = Math.round(mySlider.leaf_to.weight/self.weight_total*100);
		 
		 //Update the legend
		 self.getSvg().selectAll("text.pct")
			.text (function (d) { return d.pct+"%";})
		 
		 self.getSvg().selectAll("path.donut_arc")
			.attr("d", d3.svg.arc()
							.startAngle(function (d) { return self.degToRad(d.start_angle);	})
							.endAngle(function (d) { return self.degToRad(d.end_angle); })
							.innerRadius(arc_inner_radius)
							.outerRadius(arc_outer_radius));
		 
		 //Cat names
		 self.getSvg().selectAll("path.leaf_name_path") 
		   .attr("d", d3.svg.arc()
					.startAngle(function (d) { return self.degToRad(d.start_angle);})
					.endAngle(function (d) { return self.degToRad(d.end_angle); })
		    	 	.innerRadius(arc_outer_text_radius)
				 	.outerRadius(arc_outer_text_radius)
					);
		 
		 self.getSvg().selectAll("textPath") 
			.text(function(d) { return self.getAutoTrimmedText(d) });
		 
		 d3.select(self.moving_slider)
		 .attr("x", function (d) { return d.x})
		 .attr("y", function (d) { return d.y})
		 }
		
		return false;
	}

	
	/**
	 * Displays the donut for the current category/branch
	 */
	self.displayCurrentDonut  = function () {
		var branch = trunkManager.getBranch(self.current_branch);
		self.angle_total = 360-branch.leaves.length*arc_padding;
		
		self.weight_total=0;
		self.current_angle=0;
		branch.leaves.forEach (function (d) { self.weight_total+=d.weight });
				
		self.getSvg().select("g.donut").remove();
				
		var canvas_donut = self.getSvg().append("g").attr("class", "donut");
		
		var d3_leaves = canvas_donut.selectAll("path")
		.data(branch.leaves).enter();
		
		//Create the main donut angular sector
		d3_leaves.append("path") 
			.attr("id", function(d,i) { return d._id; })
			.attr("class", "donut_arc")
			.attr("title", function(d,i) { return d.name; }) 
			.style("stroke", "#455ba1")
			.style("fill", function (d,i) { return self.colors(d._id);})
			.attr("d", d3.svg.arc()
							.startAngle(function (d) { 
								d.start_angle = self.current_angle;
								return self.degToRad(self.current_angle);
								})
							.endAngle(function (d) { 
								var endAngle = self.current_angle+Math.round(self.angle_total*d.weight/self.weight_total);
								d.end_angle = endAngle;
								self.current_angle = endAngle+arc_padding;
								return self.degToRad(endAngle); })
							.innerRadius(arc_inner_radius)
							.outerRadius(arc_outer_radius)
			)
			.on ("mouseover", function (d) {
				d3.select(this).attr("title", function (d) { return d.pct+"%"});
				self.getSvg().selectAll("textPath.leaf_name").filter(function (g) { return g._id===d._id}).style("fill","#e06284");
				//Update the legend
				self.getSvg().selectAll("g.legend text").filter(function (g) { return g._id!=d._id})
				.transition ()
				.duration(100)
				.style("opacity", 0.2);
							
				self.getSvg().selectAll("g.legend rect").filter(function (g) { return g._id!=d._id})
				.transition ()
				.duration(100)
				.style("opacity", 0.2);
				
			})
			.on ("mouseout", function (d) {
				self.getSvg().selectAll("textPath.leaf_name").filter(function (g) { return g._id===d._id}).style("fill","black");
				//Update the legend
				self.getSvg().selectAll("g.legend text")
				.transition ()
				.duration(100)
				.style("opacity", 1);
				
				self.getSvg().selectAll("g.legend rect")
				.transition ()
				.duration(100)
				.style("opacity", 1);
			})
			.each (function (d) { d.pct = Math.round(d.weight/self.weight_total*100);});
		
		//Create the invisble path to display the leaves names
		d3_leaves.append("svg:path") 
		   .attr("id", function(d,i) { return "path_"+i; }) 
		   .attr("class", "leaf_name_path")
		   .style("fill-opacity", 0)
		   .style("stroke-width", 0)
		   .attr("d", d3.svg.arc()
					.startAngle(function (d) { return self.degToRad(d.start_angle);})
					.endAngle(function (d) { return self.degToRad(d.end_angle); })
		    	 	.innerRadius(arc_outer_text_radius)
				 	.outerRadius(arc_outer_text_radius)
					);
		
		//Display the leaves names
		canvas_donut.append("g")
		.selectAll("text")
		.data(branch.leaves).enter()
		.append("text")
		.attr("text-anchor", "middle")
		.append("svg:textPath") 
		.attr("class", "leaf_name") 
		.attr("xlink:href", function(d,i) { return "#path_"+i; }) 
		.attr("startOffset", "25%")
		.text(function(d) { return self.getAutoTrimmedText(d) });

		
		//Now we create the sliders
		var sliders = [];
		for (var i=0;i<branch.leaves.length;i++) {
			var mySlider =  new Object();
			
			mySlider.leaf_from = branch.leaves[i];
			mySlider.leaf_to = branch.leaves[(i==(branch.leaves.length-1))?0:(i+1)];
			mySlider.angle = mySlider.angle_old = branch.leaves[i].end_angle + arc_padding/2;
			mySlider.x = Math.cos (self.degToRad(mySlider.angle-90)) * arc_center_radius - slider_radius;
			mySlider.y = Math.sin (self.degToRad(mySlider.angle-90)) * arc_center_radius - slider_radius;
			
			sliders.push (mySlider);
		}
		
		canvas_donut.selectAll("g.slider")
		.data(sliders).enter().append("g")
		.attr("class", function (d,i) { return (i==sliders.length-1)?null:"slider"})
		.append("image")
		.attr("title", function (d,i) { return d.leaf_from.name+"-"+d.leaf_to.name;})
		.attr("class", function (d,i) { return "slider_"+i;})
		.attr("xlink:href", "/images/slider.png")
		.attr("width", 24)
		.attr("height", 24)
		.attr("x", function (d) { return d.x})
		.attr("y", function (d) { return d.y})
		.on ("mouseover", function (d,i) { if (i!=sliders.length-1) d3.select(this).attr("xlink:href", "/images/slider_hover.png")})
		.on ("mouseout", function (d) { d3.select(this).attr("xlink:href", "/images/slider.png")});
		
		//Update the beahvior of each slider
		for (var i=0;i<sliders.length;i++) {
			var test = $(".slider_"+i);
			
			test.mousedown ({value:test}, function (event) {
				self.moving_slider=event.data.value[0];
				document.onmousemove = self.dragSlider;
				document.onmouseup = self.endDrag;
				return false;
			});
		}
		
		//We create the legend
		var legends = canvas_donut.append("g")
		.attr("transform", "translate(182,-235)")
		.selectAll("g")
		.data(branch.leaves)
		.enter()
		.append("g")
		.sort(function (a,b) { return b.pct-a.pct})
		.attr("class", "legend")
		.attr("transform", function (d,i) { return "translate(0,"+(i*25)+")"});
		
		
		legends.append("text")
		.attr("class", "pct")
		.style("font-size", "10px")
		.attr("x", function (d,i) { return 0})
		.attr("y", function (d,i) { return 100})
		.text (function (d) { return d.pct+"%";})
		
		legends.append("rect")
		.style("stroke", "black")
		.style("fill", function (d,i) { return self.colors(d._id);})
		.attr("x", function (d,i) { return 22})
		.attr("y", function (d,i) { return 92})
		.attr("height", 10)
		.attr("width", 20);
		
		legends.append("text")
		.style("font-size", "10px")
		.attr("x", function (d,i) { return 45})
		.attr("y", function (d,i) { return 100})
		.text (function (d) { return d.name_lcl?d.name_lcl[self.language]:d.name;})
	}
	
	/**
	 * Generates the main layout with all the available branches
	 */
	self.generateSettingsDonuts = function (){
		var branches = trunkManager.getBranches();
		
	
		self.getSvg().append("g")
		.selectAll("text")
		.data(branches)
		.enter()
		.append("text")
		.attr("class", function (d,i) {return (i===self.current_branch)?"branch_title active_title":"branch_title inactive_title"})
		.attr("font-size", function (d,i) {return (i===self.current_branch)?28:12})
		.attr("x",0)
		.attr("y", function (d,i) {
			return 8+18*(i-self.current_branch)-(i<self.current_branch?12:0);
		})
		.attr("text-anchor", "middle")
		.text(function (d) { 
			var name =  d.name_lcl?d.name_lcl[self.language]:d.name;
			var myResult = d.donotshow?"( "+name+" )":name;
			return myResult;
			})
		.on ("mousedown", function (d,i) {
			self.current_branch = i;
			self.getSvg().selectAll("text.branch_title")
			.attr("class", function (g,j) {return (j===self.current_branch)?"branch_title active_title":"branch_title inactive_title"})
			.transition ()
			.duration(200)
			.attr("font-size", function (g,j) {return (j===self.current_branch)?28:12})
			.attr("y", function (g,j) {
				return 8+18*(j-self.current_branch)-(j<self.current_branch?12:0);
			})
			
			self.getSvg().selectAll("g.donotshow").remove();
			
			if (i!=0) {
				
				
				//Display the option to not to show a category
				var myGroup  = self.getSvg().append("g").attr("class", "donotshow").attr("transform", "translate(-60,180)");
				myGroup.append("image")
				.attr("xlink:href", !d.donotshow?"/images/donotshow_off.png":"/images/donotshow_on.png")
				.attr("x",0)
				.attr("y",0)
				.attr("width",16)
				.attr("height",17);
				
				myGroup.append("text")
				.attr("class", "leaf_text")
				.attr("x",25)
				.attr("y",13)
				.text(donotshow_str[self.language])
				.on("mousedown", function (g) {
					d.donotshow = !d.donotshow;
					self.getSvg().selectAll("g.donotshow image")
					.attr("xlink:href", !d.donotshow?"/images/donotshow_off.png":"/images/donotshow_on.png");
					
				
				self.getSvg().selectAll("text.branch_title")
				.text(function (f) { 
							var name =  f.name_lcl?f.name_lcl[self.language]:f.name;
							var myResult = f.donotshow?"( "+name+" )":name;
							return myResult;
							});
				});
			};
			
			self.displayCurrentDonut();
			
		});
		
		self.displayCurrentDonut();
		
	}
	
	/**
	 * Save the settings to cookie and displays the message that the settings have been saved
	 */
	self.saveSettings = function () {
		trunkManager.saveToCookie();
		var myAlert = self.getSvg().append("g").attr("class","alert").attr("transform", "translate(-100,-200)");
		myAlert.append("rect")
		.attr("width", 310)
		.attr("height", 100)
		.attr("fill", "white")
		.style("stroke", "#455ba1")
		.style("fill-opacity",0.9);
		
		myAlert.append("text")
		.attr("x", 155)
		.attr("y", 54)
		.attr("fill", "black")
		.attr("text-anchor", "middle")
		.style("opacity",1)
		.style("font-size", "18px")
		.text(settings_str[self.language]);
		
		myAlert.transition().delay(800).style("opacity",0).each ("end", function() {d3.select("g.alert").remove();});
	}
	
	//------------------------------------
	// Javascript buttons behaviors
	//------------------------------------
	
	$("#default").click(function () {
		trunkManager.resetDefaultWeights();
		self.displayCurrentDonut();
	});
	
	$("#save_cookie").click(function () {
		self.saveSettings ();
	});
	
	
	//------------------------------------
	// Loading of the page
	//------------------------------------

	
	$(document).ready(function () {
		self.language = $.cookie ('tddd_lang')?$.cookie ('tddd_lang'):'us';
		trunkManager.setBranches($.parseJSON($('#branches').val()));
		trunkManager.loadFromCookie();
		self.generateSettingsDonuts();
	});
});