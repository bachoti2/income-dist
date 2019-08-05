function addDropdown(data) {
	var vals = [...new Set(data.map(x => x.Occupation))];
	
	d3.select("#middle1")
	.insert("label", "svg")
	.attr("for", "option_occ")
	.text("Choose cccupation:");
	
	var dropdown = d3.select("#middle1")
		.insert("select", "svg")
		.attr("id", "option_occ")
		.on("change", dropdownChange);

	dropdown.selectAll("option")
		.data(vals)
	  .enter().append("option")
		.attr("value", function (d) { return d.Occupation; })
		.text(function (d) {
			return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
		});
}

function createChart(donutData, income) {
	/*donutData = donutData.filter(function(d) {
		return income == "less" ? +d.Ratio_L > 0 : +d.Ratio_H > 0;
	})
		
	console.log(income);
	console.log(donutData);*/
		////////////////////////////////////////////////////////////
		//////////////////////// Set-up ////////////////////////////
		////////////////////////////////////////////////////////////

		var screenWidth = window.innerWidth;

		var margin = {left: 20, top: 20, right: 20, bottom: 20},
			width = Math.min(screenWidth, 500) - margin.left - margin.right,
			height = Math.min(screenWidth, 500) - margin.top - margin.bottom;
					
		svg = d3.select("#middle1").append("svg")
					.attr("id", "d_canvas")
					.attr("width", (width + margin.left + margin.right))
					.attr("height", (height + margin.top + margin.bottom))
				   .append("g").attr("class", "wrapper")
					.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

		////////////////////////////////////////////////////////////// 
		///////////////////// Data &  Scales ///////////////////////// 
		////////////////////////////////////////////////////////////// 

		//Create a color scale
		var colorScale = d3.scaleLinear()
		   .domain([1,3.5,6])
		   .range(["#2c7bb6", "#ffffbf", "#d7191c"])
		   .interpolate(d3.interpolateHcl);

		//Create an arc function   
		var arc = d3.arc()
			.innerRadius(width*0.5/2) 
			.outerRadius(width*0.75/2 + 30);

		//Turn the pie chart 90 degrees counter clockwise, so it starts at the left	
		pie = d3.pie()
			.startAngle(-90 * Math.PI/180)
			.endAngle(-90 * Math.PI/180 + 2*Math.PI)
			.value(function(d) {
				return income == "less" ? +d.Ratio_L : +d.Ratio_H;
			})
			.padAngle(.01)
			.sort(null);

		var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

		////////////////////////////////////////////////////////////// 
		//////////////////// Create Donut Chart ////////////////////// 
		////////////////////////////////////////////////////////////// 

		//Create the donut slices and also the invisible arcs for the text 
		svg.selectAll(".donutArcs")
			.data(pie(donutData))
		  .enter().append("path")
			.attr("class", "donutArcs")
			.attr("d", arc)
			.style("fill", function(d,i) {
				if(i === 7) return "#CCCCCC"; //Other
				else return colorScale(i); 
			})
		.each(function(d,i) {
			var firstArcSection = /(^.+?)L/;
			var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
			newArc = newArc.replace(/,/g , " ");
			//Create a new invisible arc that the text can flow along
				svg.append("path")
					.attr("class", "hiddenDonutArcs")
					.attr("id", "donutArc"+i)
					.attr("d", newArc)
					.style("fill", "none");
		})
		.on("mousemove", function(d){
			divTooltip.style("left", d3.event.pageX+10+"px");
			divTooltip.style("top", d3.event.pageY-25+"px");
			divTooltip.style("display", "inline-block");
			var elements = document.querySelectorAll(':hover');
			l = elements.length
			l = l-1
			element = elements[l].__data__
			value = element.y1 - element.y0
			
			if (document.getElementById('radio_inc_less').checked) {
				value = "Females: "+d.data.F_Lesser+"<br>" +
						"Males: " + d.data.M_Lesser + "<br>" +
						"Ratio: " + (+d.data.Ratio_L).toFixed(2);
			} else {
				value = "Females: " + d.data.F_Greater + "<br>" +
						"Males: " + d.data.M_Greater + "<br>" +
						"Ratio: " + (+d.data.Ratio_H).toFixed(2);
			}
			divTooltip.html(value);
			})
		.on("mouseout", function(d){
			divTooltip.style("display", "none");
			});
		
		//Append the label names on the outside
		svg.selectAll(".donutText")
			.data(donutData)
		   .enter().append("text")
			.attr("class", "donutText")
			.attr("dy", -13)
		   .append("textPath")
			.attr("startOffset","50%")
			.style("text-anchor","middle")
			.attr("xlink:href",function(d,i){return "#donutArc"+i;})
			.text(function(d){return d.Status;});
}

function incomeChanged() {
	var e = document.getElementById("option_occ");
	var strOcc = e.options[e.selectedIndex].text;
	console.log(strOcc);

	updateChart(strOcc, incomeValue());
}

function incomeValue() {
	var income;
	if (document.getElementById('radio_inc_less').checked) {
		income = "less";
	} else {
		income = "more";
	}
	
	return income;
}

// Handler for dropdown value change
function dropdownChange() {	
	var e = document.getElementById("option_occ");	
	var strOcc = d3.select(this).property('value');

	updateChart(strOcc, incomeValue());
};

function updateChart(strOcc, income) {
	clearChart();
	createChart(
		marital_status.filter(function(d) {
			return d.Occupation == strOcc;
		}),
		income
	);
}

function clearChart() {
	d3.select("#d_canvas").remove();
}

var marital_status;

//d3.csv("data/marital_status.csv", function(data) {
d3.csv("https://raw.githubusercontent.com/bachoti2/income-dist/master/data/marital_status.csv", function(data) {
	marital_status = data;
	
	addDropdown(data);
	
	var e = document.getElementById("option_occ");
	var strOcc = e.options[e.selectedIndex].text;
	console.log(strOcc);

	updateChart(strOcc, incomeValue());
});