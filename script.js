// Update Pie Chart
function updatePieChart(attribute) {
    d3.csv("covid.csv").then(function(data) {
        var dimensions = {
            width: 800,  // Increased width
            height: 800, // Increased height
            radius: Math.min(800, 800) / 2 * 0.5  // Adjust radius to fit within the larger container
        };

        d3.select("#piechart").selectAll("*").remove()
        // Create SVG container
        var svg = d3.select("#piechart")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .append("g")
            .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);
            
        svg.selectAll("*").remove(); // Clears all elements before rendering new ones
        // Initialize color scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        // Initialize pie and arc generators
        var pie = d3.pie().value(d => d.count);
        var arc = d3.arc().innerRadius(0).outerRadius(dimensions.radius);

        // Group data by the selected attribute
        var groupedData = d3.rollup(
            data,
            v => v.length,
            d => d[attribute]
        );

        var filteredData = Array.from(groupedData, ([key, value]) => ({
            attribute: key,
            count: value
        }));

        // Bind data to the pie chart slices
        var slices = svg.selectAll("path").data(pie(filteredData));

        // Enter new slices
        slices.enter()
            .append("path")
            .merge(slices)
            .transition()
            .duration(1000)
            .attr("d", arc)
            .attr("fill", d => color(d.data.attribute))
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        // Remove unused slices
        slices.exit().remove();

        // Create or update the legend
        var total = d3.sum(filteredData, d => d.count); // Calculate total for percentage calculation
        var legend = svg.selectAll(".legend")
            .data(filteredData);

        // Enter new legend items
        var legendEnter = legend.enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(-${dimensions.radius + 400}, ${-dimensions.radius + i * 30})`);

        legendEnter.append("rect")
            .attr("x", dimensions.radius + 10)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => color(d.attribute));

        legendEnter.append("text")
            .attr("x", dimensions.radius + 35)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .text(d => `${d.attribute}: ${d.count} (${((d.count / total) * 100).toFixed(1)}%)`);

        // Update existing legend items
        legend.select("rect")
            .attr("fill", d => color(d.attribute));

        legend.select("text")
            .text(d => `${d.attribute}: ${d.count} (${((d.count / total) * 100).toFixed(1)}%)`);

        // Remove unused legend items
        legend.exit().remove();
    });
}

// Update Bar Chart
function updateBarChart(attribute) {
    d3.csv("covid.csv").then(function(data) {
        var dimensions = {
            width: 1000,
            height: 600,
            margin: {
                top: 10,
                bottom: 50,
                right: 10,
                left: 50
            }
        };

        var svg = d3.select("#barchart")
            .style("width", dimensions.width)
            .style("height", dimensions.height);
            svg.selectAll("*").remove(); // Clears all elements before rendering new ones

        // Clear previous bars before rendering new ones
        svg.selectAll(".bar").remove(); // Remove all previous bars

        // Initialize an empty dictionary to store counts
        var attributeCounts = {};
        data.forEach(row => {
            var attributeValue = row[attribute]; // Use selected attribute
            if (attributeCounts[attributeValue]) {
                attributeCounts[attributeValue]++;
            } else {
                attributeCounts[attributeValue] = 1;
            }
        });

        // Sort data by count
        var sortedData = Object.entries(attributeCounts)
            .sort((a, b) => b[1] - a[1]); // Sort by count in descending order

        // Set up xScale using scaleBand for categorical data
        var xScale = d3.scaleBand()
            .domain(sortedData.map(d => d[0])) // Use attribute values
            .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
            .padding(0.1);

        // Set up yScale based on the maximum count
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d[1])])
            .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

        // Create x-axis
        var xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("transform", `translate(0, ${dimensions.height - dimensions.margin.bottom})`)
            .call(xAxis)
            .append("text")
            .attr("x", dimensions.width / 2)
            .attr("y", 40)
            .attr("fill", "black")
            .text(attribute.charAt(0).toUpperCase() + attribute.slice(1).replace(/_/g, " "));

        // Create y-axis
        var yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("transform", `translate(${dimensions.margin.left}, 0)`)
            .call(yAxis)
            .append("text")
            .attr("x", -dimensions.height / 2)
            .attr("y", -35)
            .attr("transform", "rotate(-90)")
            .attr("fill", "black")
            .text("Count");

        // Draw bars using attributeCounts
        svg.selectAll(".bar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[0])) // d[0] is the attribute value
            .attr("y", d => yScale(d[1])) // d[1] is the count
            .attr("width", xScale.bandwidth()) // Set bar width based on scaleBand
            .attr("height", d => dimensions.height - dimensions.margin.bottom - yScale(d[1]))
            .attr("fill", "red");
    });
}

// Update Heatmap
function updateHeatmap() {
   // set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 450 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Labels of row and columns
var myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
var myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]

// Build X scales and axis:
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(myGroups)
  .padding(0.01);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(myVars)
  .padding(0.01);
svg.append("g")
  .call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain([1,100])

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv", function(data) {

  // create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip.style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.value)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0)
  }

  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.group+':'+d.variable;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.group) })
      .attr("y", function(d) { return y(d.variable) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.value)} )
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})

}
