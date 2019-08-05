// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#middle1")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .padding(0.2);
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
  .range([ height, 0]);
var yAxis = svg.append("g")
  .attr("class", "myYaxis")

var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

// A function that create / update the plot for a given variable:
function update(data) {
	/*data = occupation.filter(function(d) {
			return d.Ratio != "NA" && d.Income == income;
		});*/

	// sort data
	//If oncome < 50k
  /*data.sort(function(b, a) {
    return a.Ratio - b.Ratio;
  });*/
  
  // Update the X axis
  x.domain(data.map(function(d) { return d.Occupation; }))
  xAxis.call(d3.axisBottom(x))
	.selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");  

  // Update the Y axis
  y.domain([0, d3.max(data, function(d) { return +d.Ratio }) + 0.1 ]);
  yAxis.transition().duration(1000).call(d3.axisLeft(y));

	//console.log(data);
  // Create the u variable
  var u = svg.selectAll("rect")
    .data(data)

//console.log(u.enter());
  u
    .enter()
    .append("rect") // Add a new rect for each new elements
    .merge(u) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(1000)
      .attr("x", function(d) { return x(d.Occupation); })
      .attr("y", function(d) { return y(+d.Ratio); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(+d.Ratio); })
      .attr("fill", "#69b3a2")

  // If less Occupations in the new dataset, I delete the ones not in use anymore
  //console.log(u.exit());
  u
    .exit()
    .remove()
	
	//tooltip
	svg.selectAll("rect")
	.on("mousemove", function(d){
		divTooltip.style("left", d3.event.pageX+10+"px");
		divTooltip.style("top", d3.event.pageY-25+"px");
		divTooltip.style("display", "inline-block");
		var elements = document.querySelectorAll(':hover');
		l = elements.length
		l = l-1
		element = elements[l].__data__
		value = element.y1 - element.y0
		value = d.Ratio
		divTooltip.html("Female: "+d.Female+"<br>Male: "+d.Male+"<br>"+
					"Ratio: "+(+d.Ratio).toFixed(2));
		})
	.on("mouseout", function(d){
		divTooltip.style("display", "none");
		});
}

var data1, data2;

//occupation = d3.csv("data/occupation.csv", function(occupation) {
d3.csv("https://raw.githubusercontent.com/bachoti2/income-dist/master/data/occupation.csv", function(data) {
		data1 = data.filter(function(d) {
			return d.Ratio != "NA" && d.Income == "Lesser";
		});
		
		data2 = data.filter(function(d) {
			return d.Ratio != "NA" && d.Income != "Lesser";
		});
		
		//update(occupation, "Lesser");
		update(data1);
		
		//return occupation;
});

// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
	.attr("class", "tooltip")
	.style("display", "none");
  
tooltip.append("rect")
	.attr("width", 60)
	.attr("height", 20)
	.attr("fill", "white")
	.style("opacity", 0.5);

tooltip.append("text")
	.attr("x", 30)
	.attr("dy", "1.2em")
	.style("text-anchor", "middle")
	.attr("font-size", "12px")
	.attr("font-weight", "bold");