// ================================================
//                Important 
// ================================================
// Faites attention aux variables que vous donnez ! Je vous donne un exemple 'type'
// Mais il faut adapter chaque variable au nom du fichier pour éviter les soucis lors du merge !
// Pensez aussi a adapter les tailles et tout à ce que vous voulez rendre !

// Definition de la taille du svgDefo (width et height)
var marginDefo = { top: -100, right: 10, bottom: 0, left: 10 };
var wDefo = 400 - marginDefo.left - marginDefo.right;
var hDefo = 400 - marginDefo.top - marginDefo.bottom;
var radius = Math.min(wDefo, hDefo) / 2;
var csvData;
var dateActu = "2019";

var svgDefo = d3.select("#grapheDeforestation")
	.append("svg")
	.attr("width", "100%")
	.attr("height", hDefo)
	  .attr("viewBox", [-wDefo / 2, -hDefo / 2, wDefo, hDefo]);

var pieDefo = d3.pie()
	.padAngle(0.005)
	.sort(null)
	.value(d => {if(d.annee === dateActu) return d.perte_surface_ha})

var outerArc = d3.arc()
  	.innerRadius(radius*1.2)
  	.outerRadius(radius)

//var dateArray = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"]; 

d3.csv("https://raw.githubusercontent.com/pltreger/Deforestation/main/data/perte_couverture_mondiale_par_causes.csv").then(function(data) {
	//console.log(data)
	csvData = data;
	update(dateActu)
})

function update(annee) {

	svgDefo
		.selectAll('path')
		.remove()
	svgDefo
		.selectAll('text')
		.remove()
	svgDefo
		.selectAll('polyline')
		.remove()
	//console.log(annee)
	dateActu = annee;
	var arcsDefo = pieDefo(csvData);

	var colorDefo = d3.scaleOrdinal()
      .domain(csvData.map(d => {if(d.annee === annee) return d.cause}))
	  .range(["#54478C","#EFEA5A","#0DB39E","#2C699A","#B9E769","#F29E4C"]);
	
	svgDefo
      .append("text")
      .attr("class", "cssDefo")
      .attr("x", 70)
      .attr("y", 20)
      .style("text-anchor", "end")
      .html(~~dateActu);
	  
	svgDefo.selectAll("path")
	  .data(arcsDefo)
	  .enter()
	  .append("path")
	  .transition()
	  .duration(1000)
		.attr("fill", d => colorDefo(d.data.cause))
		.attr("d", d3.arc().innerRadius(radius * 0.67).outerRadius(radius))

	svgDefo
		.selectAll('allPolylines')
		.data(arcsDefo)
		.enter()
		.append('polyline')
		  .attr("stroke", "black")
		  .style("fill", "none")
		  .attr("stroke-width", 1)
		  .attr('points', function(d) {
			if(d.data.annee === annee) {
				var posA = d3.arc().innerRadius(radius * 0.67).outerRadius(radius).centroid(d) // line insertion in the slice
				var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
				var posC = outerArc.centroid(d); // Label position = almost the same as posB
				var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
				posC[0] = radius * 1.2 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
				return [posA, posB, posC]
			}
		  })
	  
	  // Add the polylines between chart and labels:
	svgDefo
		.selectAll('allLabels')
		.data(arcsDefo)
		.enter()
		.append("text")
			.attr('transform', function(d) {
				var pos = outerArc.centroid(d);
				var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
				pos[0] = radius * 1.3 * (midangle < Math.PI ? 1 : -1);
				return 'translate(' + pos + ')';
			})
			.call(text => text.append("tspan")
				.attr("y", "-0.4em")
				.attr("font-weight", "bold")
				.text(d => {if(d.data.annee === annee) return d.data.cause}))
			.style('text-anchor', function(d) {
					var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
					return (midangle < Math.PI ? 'start' : 'end')
			})
			.call(text => text.append("tspan")
				.attr("x", 0)
				.attr("y", "0.7em")
				.attr("fill-opacity", 0.7)
				.text(d => {if(d.data.annee === annee) return (parseInt(d.data.perte_surface_ha) + " ha")})
			.style('text-anchor', function(d) {
				var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
				return (midangle < Math.PI ? 'start' : 'end')
			}))
}