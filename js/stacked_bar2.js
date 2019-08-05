// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 20, left: 50},
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

// Parse the Data
d3.csv("data/total.csv", function(data) {
  var subgroups = data.columns.slice(1)

  // List of groups
  var groups = d3.map(data, function(d){return(d.Sex)}).keys()
  console.log(groups);
  
  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return (+d.Income_L) + (+d.Income_H); })]).nice()
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

	var divTooltip = d3.select("body").append("div").attr("class", "toolTip");
	
  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
	.range(['green','orange'])
    //.range(['#e41a1c','#4daf4a'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // Show the bars
  svg.append("g")
	.attr("id", "canvas")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.Sex); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
		.on("mousemove", function(d){
                divTooltip.style("left", d3.event.pageX+10+"px");
                divTooltip.style("top", d3.event.pageY-25+"px");
                divTooltip.style("display", "inline-block");
                var elements = document.querySelectorAll(':hover');
                l = elements.length
                l = l-1
                element = elements[l].__data__
                value = element.y1 - element.y0
				value = d[1]-d[0]
                divTooltip.html("Count: "+value);
            })
            .on("mouseout", function(d){
                divTooltip.style("display", "none");
            });
		
	//Add legends
	/*var legend = svg.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data(subgroups.slice().reverse())
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
		
	var legend = d3.select("#canvas")
		.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data(subgroups.slice().reverse())
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });*/
	
	var padding = 100;
	
	var legend = svg.append('g')
	.attr('class', 'legend')
	.attr('transform', 'translate(' + (width - 220) + ', 0)');

	legend.selectAll('rect')
	.data(subgroups)
	.enter()
	.append('rect')
	.attr('x', 0)
	.attr('y', function(d, i){
	return i * 18;
	})
	.attr('width', 12)
	.attr('height', 12)
	.attr('fill', function(d, i){
	return color(i);
	});

	legend.selectAll('text')
	.data(subgroups)
	.enter()
	.append('text')
	.text(function(d){
	return (d == "Income_L" ? "Income < 50k" : "Income > 50k");
	})
	.attr('x', 18)
	.attr('y', function(d, i){
	return i * 18;
	})
	.attr('text-anchor', 'start')
	.attr('alignment-baseline', 'hanging');
})

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
