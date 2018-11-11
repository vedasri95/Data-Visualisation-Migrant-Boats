function BuildingApp() {
  var svg;
  var width = 910;
  var height = 610;
  var trajectories;
  var timeline;

  function me(selection) {
    console.log("BuildingApp");
    d3.text("assets/data/building_map.txt")
      .then(function(map) {
        let aMap = map.split('\n').map(function(d) {
          return d.trim().split(' ').map(function(e) {
            return +e
          })
        });
        console.log('map', aMap);
        let building = buildingBitmap();

        svg = d3.select("#building")
  				.append("svg")
  				.attr("width", width)
  			.attr("height", height);

			svg.append("g")
				.classed("buildingMap", true)
				.datum(aMap)
				.call(building);

      })
      .catch(function(error) {
        console.log(error);
      });

    d3.tsv("assets/data/rfid_assignments.txt")
      .then(rows => {
        let ids = rows
          .filter(row => {
            let entries = d3.values(row);
            return (entries[0].length > 0) // ignore rows with invalid id (not numeric)
          })
          .map(row => {
            let entries = d3.values(row);
            return {
              id: +entries[0],
              person: entries[1]
            }
          });
        console.log("ids", ids);

        me.personList = PersonList();
  			d3.select("#persons")
  				.datum(ids)
  			.call(me.personList);
      });

    d3.tsv("assets/data/rfid_pathway.txt")
    .then(rows => {
      let paths = rows.map(row => {
        return {
          person: +row.Person,
          time: +row.Time,
          x: +row.xcor,
          y: +row.ycor
        }
      });
      var trajs = d3.nest()
        .key(function(d){return d.person})
      .entries(paths);

      var trs = d3.values(trajs).map(function(d){
        var pl = d.values.map(function(p,i){
          if(i==0) return 0;
          return euclideanDistance(p, d.values[i-1])
        });
        return {
        person: +d.key,
        values: d.values.map(function(p){return {x:p.x, y:p.y}}),
        path_length: pl.reduce(function(a,b){return a+b}, 0),
        delta_s: pl
      }});

      console.log("trajs",trajs);
      console.log("trs",trs);

      trajectories = Trajectories();
      svg.append("g")
        .classed("trajs",true)
        .datum(trs)
      .call(trajectories);

      // timeline = TimelineBrush().domain([0,trs[0].values.length]);
      // d3.select("#timeline")
      // .call(timeline);

      // d3.select("#status")
      // .call(me.statusbar);
    });

  }
  function euclideanDistance(a,b){
		return Math.sqrt(Math.pow(a.x -b.x,2) + Math.pow(a.y - b.y,2));
	}

	function distances(p1,p2){
		console.log("p1",p1);
		console.log("p2",p2);
		return p1.values.map(function(d,i){
			return [i, euclideanDistance(d, p2.values[i])]
			});
	}



  return me;
}

function registerEventListeners(){
  dispatch.on("updatedPersonSelection.list", function(selectedPersons){
    d3.select("#persons")
      .selectAll(".list-group-item")
      .classed("active",function(l){return selectedPersons[l.id]});

    // buildingApp.statusbar.refresh();
  })

  dispatch.on("updatedPersonSelection.trajs", function(selectedPersons){
    console.log("updatedPersonSelection", selectedPersons);
    d3.select("#building")
      .select("svg g.trajs")
      .selectAll("path")
      // .attr("stroke", "#f00")
      .classed("active", function(l){return selectedPersons[l.person]})
  });

  dispatch.on("intervalSelection", function(d){
    // console.log("intervalSelection", d);
    if(d[0]!=d[1])
      buildingApp.trajectories().timeExtent(d);

    // buildingApp.statusbar.refresh();
  })
}

var dispatch = d3.dispatch("intervalSelection", "updatedPersonSelection");

var buildingApp = BuildingApp();
registerEventListeners();

d3.select("#main")
  .call(buildingApp);
