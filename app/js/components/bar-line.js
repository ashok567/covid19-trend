/* exported draw_bar */

function draw_bar(data){
  var div_width = $('#bar_div').width()
  var margin = {top: 20, right: 40, bottom: 30, left: 50},
      width = div_width - margin.left - margin.right,
      height = 220 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%m"),
  col_list = _.keys(data[0]),
  date = col_list[0],
  bar = col_list[1],
  line1 = col_list[2],
  line2 = col_list[3],
  line3 = col_list[4]

  data.forEach(function(d) {
    d[date] = parseTime(d[date]);
  });

  // set the ranges
  var xScale = d3.scaleBand().range([0, width]).paddingInner(0.6).paddingOuter(0.3);
  var yLine = d3.scaleLinear().range([height, 0]);
  var yBar = d3.scaleLinear().range([height, 0]);

  xScale.domain(data.map(function(d) { return d[date]; }));
  var yline_max_val = d3.max(data, function(d) { return d[line1]; })
  var ybar_max_val = d3.max(data, function(d) { return d[bar]; })
  yLine.domain([0, yline_max_val]);
  yBar.domain([0, ybar_max_val]);

  var svg = d3.select("#bar_div").append("svg")
    .attr('viewBox', [0, 0, div_width, height + margin.top + margin.bottom])
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var valueFormat = d3.format(".2s"),
  timeFormat = d3.timeFormat('%b')

  var rect = svg.selectAll("rect")
  .data(data)

  rect.enter().append("rect")
    .attr("class", "bar")
    .style("stroke", "none")
    .style("fill", "#ccc")
    .style("opacity", 0.8)
    .attr("x", function(d){ return xScale(d[date]); })
    .attr("width", xScale.bandwidth())
    .attr("y", function(d){ return  yBar(d[bar]);})
    .attr("height", function(d){ return height - yBar(d[bar]); })
    .attr('data-placement', 'right')
    .attr('data-toggle', 'toggle')
    .attr('class', 'barline-slice')
    .attr('data-title', function(d){
      return `${timeFormat(d[date])} - ${valueFormat(d[bar])}`
    })

  var line_colors = ['#0a67ad', '#26c281', '#d95043']

  _.each([line1, line2, line3], function(k, i){
    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return xScale(d[date])+ xScale.bandwidth()/2; })
        .y(function(d) { return yLine(d[k]); });

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", `line${i}`)
        .transition().ease(d3.easeBounce).duration(700).delay(700)
        .style("stroke", line_colors[i])
        .style("stroke-width", '2px')
        .attr("d", valueline)
        .attr("fill", "none");

    var points = svg.selectAll(`circle.point${i}`)
    .data(data)

    points.enter().append("circle")
        .attr("class", `point${i}`)
        .transition().ease(d3.easeBounce).duration(500).delay(500)
        .style("stroke", '#fff')
        .style("stroke-width", "1px")
        .style("fill", line_colors[i])
        .attr("cx", function(d){ return xScale(d[date]) + xScale.bandwidth()/2; })
        .attr("cy", function(d){ return yLine(d[k]); })
        .attr("r", "3px")
        .attr('data-placement', 'right')
        .attr('data-toggle', 'toggle')
        .attr('class', 'barline-slice')
        .attr('data-title', function(d){
          return `${timeFormat(d[date])} - ${valueFormat(d[k])}`
        })
  })

  // Add the X Axis
  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).tickFormat(timeFormat).tickSize(0).tickPadding(8));

  // Add the Y1 Axis
  var lineTickValues = divideTicks(0, yline_max_val, 4)
  svg.append("g")
    .attr("class", "ylineaxis")
    .call(d3.axisLeft(yLine).tickValues(lineTickValues).tickSize(-width).tickFormat(valueFormat).tickPadding(8));

    // Add the Y2 Axis
  var barTickValues = divideTicks(0, ybar_max_val, 4)
  svg.append("g")
    .attr("class", "ybaraxis")
    .attr("transform", "translate( " + width + ", 0 )")
    .call(d3.axisRight(yBar).tickValues(barTickValues).tickSize(0).tickFormat(valueFormat).tickPadding(8));

  svg.append('text')
    .attr('class', 'ylineaxis label')
    .attr('text-anchor', 'middle')
    .attr('x', -height/2)
    .attr('y', -margin.right)
    .attr('font-size', '12px')
    .attr('transform', 'rotate(-90)')
    .text('Cases');

  svg.append('text')
    .attr('class', 'ybaraxis label')
    .attr('text-anchor', 'middle')
    .attr('x', -height/2)
    .attr('y', width+margin.right)
    .attr('font-size', '12px')
    .style('fill', '#797979')
    .attr('transform', 'rotate(-90)')
    .text('Tests');

  svg.selectAll('.ylineaxis text')
  .style('fill', '#000')

  svg.selectAll('.xaxis text')
  .style('fill', '#000')
  .style('font-size', '12px')

  svg.selectAll('path.domain')
  .style('stroke', 'none')


  d3.selectAll('.ylineaxis .tick').each(function(d) {
    d3.select(this).select("line").style("stroke-dasharray", function() {
      return d==0 ? '0':'5 5'
    })
    d3.select(this).select("line").style("opacity", function() {
      return d==0 ? '1':'0.4'
    })
  })
}
