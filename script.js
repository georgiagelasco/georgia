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
    d3.csv("covid.csv").then(function(data) {
        var dimensions = {
            margin: {
                top: 50,
                bottom: 100,
                right: 50,
                left: 100
            },
            cellSize: 50, // Adjust for better visualization
            width: 0,     // Will be calculated dynamically
            height: 0
        };

        // Extract unique age groups and race/ethnicities
        var ageGroups = Array.from(new Set(data.map(d => d.age_group)));
        var raceEthnicities = Array.from(new Set(data.map(d => `${d.race} (${d.ethnicity})`)));

        // Update width and height based on the data and cell size
        dimensions.width = raceEthnicities.length * dimensions.cellSize;
        dimensions.height = ageGroups.length * dimensions.cellSize;

        console.log(dimensions.height)
        console.log(dimensions.width)

        // Create SVG container
        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

        // Count occurrences of each age group and race/ethnicity combination
        var counts = d3.rollup(
            data,
            v => v.length,
            d => d.age_group,
            d => `${d.race} (${d.ethnicity})`
        );

        // Generate heatmap data
        var heatmapData = [];
        ageGroups.forEach((ageGroup, rowIndex) => {
            raceEthnicities.forEach((raceEthnicity, colIndex) => {
                var count = counts.get(ageGroup)?.get(raceEthnicity) || 0;
                heatmapData.push({ ageGroup, raceEthnicity, rowIndex, colIndex, count });
            });
        });

        // Define color scale
        var maxCount = d3.max(heatmapData, d => d.count);
        var colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, maxCount]);

        // Create grid cells
        svg.selectAll("rect")
            .data(heatmapData)
            .enter()
            .append("rect")
            .attr("x", d => d.colIndex * dimensions.cellSize)
            .attr("y", d => d.rowIndex * dimensions.cellSize)
            .attr("width", dimensions.cellSize)
            .attr("height", dimensions.cellSize)
            .style("fill", d => colorScale(d.count))
            .style("stroke", "#ccc");

        // Add labels for columns (race/ethnicities)
        svg.selectAll(".colLabel")
            .data(raceEthnicities)
            .enter()
            .append("text")
            .attr("class", "colLabel")
            .attr("x", (_, i) => i * dimensions.cellSize + dimensions.cellSize / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(d => d)
            .on("click", function(event, d){
                d3.select(this).style("fill", "gray")
            });

        // Add labels for rows (age groups)
        svg.selectAll(".rowLabel")
            .data(ageGroups)
            .enter()
            .append("text")
            .attr("class", "rowLabel")
            .attr("x", -10)
            .attr("y", (_, i) => i * dimensions.cellSize + dimensions.cellSize / 2)
            .attr("text-anchor", "end")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(d => d);
    });
}
