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

function createChart(data) {
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 
	
// setup x 
var xValue = function(d) { return d.age;}, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
	xAxis = d3.axisBottom(xScale);

// setup y
var yValue = function(d) { return d["hours_per_week"];}, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
	yAxis = d3.axisLeft(yScale);

// setup fill color
var cValue = function(d) { return d.sex;},
	color = d3.scaleOrdinal(d3.schemeCategory10);

// add the graph canvas to the body of the webpage
var svg = d3.select("#middle1").append("svg")
	.attr("id", "d_canvas")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
	
	var divTooltip = d3.select("body").append("div").attr("class", "toolTip");
	
	// don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Age");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Hours per week");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
	  .on("mousemove", function(d){
			divTooltip.style("left", d3.event.pageX+10+"px");
			divTooltip.style("top", d3.event.pageY-25+"px");
			divTooltip.style("display", "inline-block");
			var elements = document.querySelectorAll(':hover');
			l = elements.length
			l = l-1
			element = elements[l].__data__
			value = element.y1 - element.y0
			
			value = "Age: " + xValue(d) 
	        + "<br/>" + "Hours/wk : " + yValue(d);
			divTooltip.html(value);
			})
		.on("mouseout", function(d){
			divTooltip.style("display", "none");
			});

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
}

function incomeChanged() {
	var e = document.getElementById("option_occ");
	var strOcc = e.options[e.selectedIndex].text;
	//console.log(strOcc);

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
		adults.filter(function(d) {
			return d.Occupation == strOcc &&
			 (income == "less" ? d.income == "<=50K" : d.income == ">50K");
		})
	);
}

function clearChart() {
	d3.select("#d_canvas").remove();
}

var adults;

// load data
//d3.csv("data/adult_data.csv", function(error, data) {
d3.csv("https://raw.githubusercontent.com/bachoti2/income-dist/master/data/adult_data.csv", function(data) {
  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.age = +d.age;
    d["hours_per_week"] = +d["hours_per_week"];
  });
  
  adults = data;
  
  addDropdown(data);
	
	var e = document.getElementById("option_occ");
	var strOcc = e.options[e.selectedIndex].text;
	
	updateChart(strOcc, incomeValue());
});