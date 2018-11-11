function PersonList(){

	var selectedPersons = {};

	function me(selection){
		console.log(selection);
		var list = selection.append("div")
			.classed("list-group",true)
			.attr("style","height:620px; overflow:scroll")
			.selectAll("a")
			.data(function(d){return d})
			.enter()
			.append("a")
			.attr("href","#")
		.classed("list-group-item",true)
		.on("click",function(d){
			me.togglePersonSelection(d);
			// dispatch.togglePersonSelection(d);
		});

		list.append("span")
			.classed("badge",true)
		.text(function(d){return d.id});

		list.append("span")
			.text(function(d){return d.person})


	}

	me.togglePersonSelection = function(d){
		if(selectedPersons[d.id]){
			delete selectedPersons[d.id]
		}else
			selectedPersons[d.id] = d;

		dispatch.call('updatedPersonSelection', this, selectedPersons);
	}

	me.selectMultiplePersons = function(list){
		selectedPersons = {};
		list.forEach(function(p){
			selectedPersons[p.id] = p;
		})

		dispatch.call('updatedPersonSelection', this, selectedPersons);
	}

	me.unselectAll = function(){
		selectedPersons = {};
		dispatch.call('updatedPersonSelection', this, selectedPersons);
	}

	me.selectedPersons = function(){
		return selectedPersons;
	}

	return me;
}
