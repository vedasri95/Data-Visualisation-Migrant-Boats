function Trajectories() {
  var container;
  var paths;

  var x = d3.scaleLinear()
    .domain([0, 91])
    .range([5, 915]);

  var y = d3.scaleLinear()
    .domain([0, 60])
    .range([605, 5]);

  var path = d3.line()
    .x(function(d) {
      return x(d.x)
    })
    .y(function(d) {
      return y(d.y)
    });

  var brush = d3.brush()
    .on("end", brushended);


  var timeExtent = [0, 837];

  function me(selection) {
    // draw all trajectories
    container = selection;
    paths = container.selectAll("path")
      .data(container.datum(), function(d) {
        return d.person
      });

    paths = paths
      .enter()
      .append("path")
      .merge(paths)
      .attr("stroke-width", 2)
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("opacity", 0.4);

    paths.attr("d", function(d) {
      return path(d.values.slice(timeExtent[0], timeExtent[1])) + "m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 ";
    });

    container.append("g")
      .attr("class", "brush")
      .call(brush);
  }

  me.timeExtent = function(_) {
    if (!arguments.length) return timeExtent;
    timeExtent = _;

    // var paths = container.selectAll("path")
    // 	.data(container.datum(), function(d){return d.person});
    paths.attr("d", function(d) {
      return path(d.values.slice(timeExtent[0], timeExtent[1])) + "m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 ";
    });
  }

  function brushed() {
    // to implement on-the-fly render during selection

  }

  function brushended() {
    if (!d3.event.selection){
      console.log("empty selection");
      buildingApp.personList.selectMultiplePersons([])
      return ;
    }

    // the extent measured in pixel should be mapped back to domain coordinates
    let extent =
        d3.event.selection.map( c => {
          return [x.invert(c[0]), y.invert(c[1])];
        })
    ;
    console.log('original extent',d3.event.selection);
    console.log('new extent', extent);
    var list = [];
    container.datum().forEach(function(p) { // for each person
      let lastPoint = p.values[timeExtent[1] - 1];
      // console.log(isWithin(lastPoint, extent), {p:lastPoint, e: extent});
      if (isWithin(lastPoint, extent)){
        console.log({p:lastPoint, e: extent});
        list.push({
          id: p.person
        });
      }
    })
    console.log('list', list.length);
    buildingApp.personList.selectMultiplePersons(list);
  }

  function isWithin(p, e) {
    return ((p.x >= e[0][0]) && (p.x <= e[1][0])
          && (p.y >= e[1][1]) && (p.y <= e[0][1]));
  }

  return me;
}
