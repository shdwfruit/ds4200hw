// -------------------------------------- Part 2.1 ------------------------------------------
// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 30, bottom: 30, left: 30};
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#f9f7f2');

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes)-5, d3.max(data, d => d.Likes)+5])
        .range([height - margin.bottom, margin.top]);

    // Add scales     
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Likes");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };

    // Groups the data by Platform and calculates statistics 
    // (min, q1, median, q3, max) for each platform
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    // For each platform group, draw the boxplot elements using the calculated statistics
    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth/2)
            .attr("x2", x + boxWidth/2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Add horizontal lines at min and max
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.min))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.max))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "lightgray")
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black");
    });
});

// -------------------------------------- Part 2.2 ------------------------------------------
// First load and process the raw data
d3.csv("socialMedia.csv").then(function(rawData) {
    // Calculate averages by Platform and PostType
    const avgData = d3.rollup(
        rawData,
        v => Number(d3.mean(v, d => +d.Likes).toFixed(2)), // Round to 2 decimals
        d => d.Platform,
        d => d.PostType
    );

    // Convert to array format matching the required structure
    const processedData = [];
    avgData.forEach((platformData, platform) => {
        platformData.forEach((avgLikes, postType) => {
            processedData.push({
                Platform: platform,
                PostType: postType,
                AvgLikes: avgLikes
            });
        });
    });

    // Now use this processed data for the visualization
    createBarPlot(processedData);
});

// Move the bar plot creation into a function
function createBarPlot(data) {
    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 30, bottom: 30, left: 30};
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#f9f7f2');

    // Define scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    

    // Add scales x0 and y     
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Average Likes");

    // Group container for bars
    const barGroups = svg.selectAll("bar")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add legend rectangles
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");

      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(type));
  });
}

// -------------------------------------- Part 2.3 ------------------------------------------
// First load and process the raw data for time series
d3.csv("socialMedia.csv").then(function(rawData) {
    // Calculate averages by Date
    const avgData = d3.rollup(
        rawData,
        v => Number(d3.mean(v, d => +d.Likes).toFixed(2)), // Round to 2 decimals
        d => d.Date
    );

    // Convert to array format matching the required structure
    const processedData = [];
    avgData.forEach((avgLikes, date) => {
        processedData.push({
            Date: date,
            AvgLikes: avgLikes
        });
    });

    // Sort by date
    processedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // Now use this processed data for the visualization
    createLinePlot(processedData);
});

// Move the line plot creation into a function
function createLinePlot(data) {
    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 30, bottom: 50, left: 30};
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#f9f7f2');

    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height - margin.bottom, margin.top]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .style("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.Date) + xScale.bandwidth()/2)
            .y(d => yScale(d.AvgLikes))
            .curve(d3.curveNatural)
        );
}
