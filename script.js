// Update Pie Chart
function updatePieChart(attribute) {
    d3.csv("covid.csv").then(function (data) {
        var dimensions = {
            width: 800,
            height: 800,
            radius: Math.min(800, 800) / 2 * 0.5,
        };

        d3.select("#piechart").selectAll("*").remove();
        var svg = d3.select("#piechart")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .append("g")
            .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

        var color = d3.scaleOrdinal(d3.schemeCategory10);
        var pie = d3.pie().value((d) => d.count);
        var arc = d3.arc().innerRadius(0).outerRadius(dimensions.radius);

        var groupedData = d3.rollup(
            data,
            (v) => v.length,
            (d) => d[attribute]
        );

        var filteredData = Array.from(groupedData, ([key, value]) => ({
            attribute: key,
            count: value,
        }));

        var slices = svg.selectAll("path").data(pie(filteredData));

        slices
            .enter()
            .append("path")
            .merge(slices)
            .attr("d", arc)
            .attr("fill", (d) => color(d.data.attribute))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .on("click", function (event, d) {
                var slice = d3.select(this);
                var isActive = slice.attr("data-active") === "true";

                // Toggle active state
                slice.attr("data-active", !isActive);

                if (isActive) {
                    // Reset to original color
                    slice.transition().duration(500).attr("fill", color(d.data.attribute));
                    svg.selectAll(`.label-${d.data.attribute.replace(/\s+/g, "-")}`).remove();
                } else {
                    // Change to gray and add percentage text
                    slice.transition().duration(500).attr("fill", "black");

                    // Calculate percentage
                    var total = d3.sum(filteredData, (d) => d.count);
                    var percentage = ((d.data.count / total) * 100).toFixed(1);

                    svg.append("text")
                        .attr("class", `label-${d.data.attribute.replace(/\s+/g, "-")}`)
                        .attr("transform", `translate(${arc.centroid(d)})`)
                        .attr("text-anchor", "middle")
                        .attr("dy", ".35em")
                        .attr("fill", "white")
                        .style("font-size", "14px")
                        .text(`${percentage}%`);
                }
            });

        slices.exit().remove();

        var total = d3.sum(filteredData, (d) => d.count);
        var legend = svg.selectAll(".legend").data(filteredData);

        var legendEnter = legend
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                (d, i) => `translate(-${dimensions.radius + 400}, ${-dimensions.radius + i * 30})`
            );

        legendEnter
            .append("rect")
            .attr("x", dimensions.radius + 10)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d) => color(d.attribute));

        legendEnter
            .append("text")
            .attr("x", dimensions.radius + 35)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .text((d) => `${d.attribute}: ${d.count} (${((d.count / total) * 100).toFixed(1)}%)`);

        legend.select("rect").attr("fill", (d) => color(d.attribute));

        legend.select("text").text(
            (d) => `${d.attribute}: ${d.count} (${((d.count / total) * 100).toFixed(1)}%)`
        );

        legend.exit().remove();
    });
}


// Update Bar Chart
function updateBarChart(attribute) {
    d3.csv("covid.csv").then(function(data) {
        var dimensions = {
            width: 1000,
            height: 600,
            margin: { top: 10, bottom: 50, right: 10, left: 50 }
        };

        var svg = d3.select("#barchart")
            .style("width", dimensions.width)
            .style("height", dimensions.height);
        
        svg.selectAll("*").remove();

        var attributeCounts = {};
        data.forEach(row => {
            var attributeValue = row[attribute];
            if (attributeCounts[attributeValue]) {
                attributeCounts[attributeValue]++;
            } else {
                attributeCounts[attributeValue] = 1;
            }
        });

        var sortedData = Object.entries(attributeCounts)
            .sort((a, b) => b[1] - a[1]);

        var xScale = d3.scaleBand()
            .domain(sortedData.map(d => d[0])) 
            .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
            .padding(0.1);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d[1])])
            .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

        svg.append("g")
            .attr("transform", `translate(0, ${dimensions.height - dimensions.margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${dimensions.margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        var bars = svg.selectAll(".bar")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", xScale.bandwidth()) 
            .attr("height", d => dimensions.height - dimensions.margin.bottom - yScale(d[1]))
            .attr("fill", "red")
            .on("click", function(event, d) {
                var bar = d3.select(this);
                var count = d[1];
            
                // Toggle the fill color between green and red
                var isActive = bar.attr("fill") === "black";
                var newColor = isActive ? "red" : "black";
                bar.attr("fill", newColor);
            
                // Remove the previous text if "unclicked"
                //bar.select("text").remove();
            
                if (!isActive) {
                    svg.append("text")
                        .attr("x", xScale(d[0]) + xScale.bandwidth() / 2)
                        .attr("y", yScale(d[1]) - 10)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .text(count);
                }
            });

    });
}

// Update Heatmap
function updateHeatmap() {
    var margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    var myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

    var x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.01);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    var y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

    var myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1, 100]);

    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv", function(data) {

        var tooltip = d3.select("#my_dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        var mouseover = function(d) {
            tooltip.style("opacity", 1);
        };
        var mousemove = function(d) {
            tooltip
                .html("The exact value of<br>this cell is: " + d.value)
                .style("left", (d3.mouse(this)[0] + 70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");
        };
        var mouseleave = function(d) {
            tooltip.style("opacity", 0);
        };

        svg.selectAll()
            .data(data, function(d) { return d.group + ':' + d.variable; })
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.group); })
            .attr("y", function(d) { return y(d.variable); })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function(d) { return myColor(d.value); })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    });
}
