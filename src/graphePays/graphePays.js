// ================================================
//                Important 
// ================================================
// Faites attention aux variables que vous donnez ! Je vous donne un exemple 'type'
// Mais il faut adapter chaque variable au nom du fichier pour éviter les soucis lors du merge !
// Pensez aussi a adapter les tailles et tout à ce que vous voulez rendre !

// Definition de la taille du svgP (widthP et heightP)
var marginP = {top: 50, right: 100, bottom: 30, left: 60},
    widthP = 1200 - marginP.left - marginP.right,
    heightP = 400 - marginP.top - marginP.bottom;

var paysDefaut = 'Bresil';
var csvDataP;
var csvDataPays = [];
// append the svgP object to the body of the page
var svgP = d3.select("#graphePays")
  .append("svg")
    .attr("width", "100%")
    .attr("height", heightP + marginP.top + marginP.bottom)
    .attr("viewBox", [350, 0, 500, 450])
  .append("g")
    .attr("transform",
          "translate(" + marginP.left + "," + marginP.top + ")");
//Read the data
d3.csv("https://raw.githubusercontent.com/pltreger/Deforestation/main/data/perte_couverture_par_pays_par_causes.csv").then(function(data) {

    csvDataP = data;
    updateP(paysDefaut);
})

function updateP(paysD) {

    svgP
		.selectAll('path')
        .remove()
    svgP
		.selectAll('circle')
        .remove()
    svgP
		.selectAll('.tick')
        .remove()
    svgP
        .selectAll('text')
        .remove()

    paysDefaut = paysD;

    // GESTION DES DONNEES
    for(var i = 0; i < csvDataP.length; i++) {
        if(csvDataP[i].pays === paysDefaut) {
            csvDataPays.push(csvDataP[i])
        }
    }

    csvDataPays = csvDataPays.sort(function compare(a, b) {
        return a.annee - b.annee;
    });

    var allCause = ["Agriculture", "Autres", "Deforestation due aux produits de base", "Foresterie", "Feu de foret", "Urbanisation"]

    csvDataPays = allCause.map( function(grpName) {
        return {
          name: grpName,
          values: csvDataPays.filter(d => d.cause === grpName)
    }});

    // Mettre à jour le max de la courbe Y
    let max = 0;
    csvDataPays.forEach(p => {
        return p.values.forEach(m => {
            max = Math.max(max, m.perte_surface_ha)
        })
    });

    svgP
      .append("text")
      .attr("class", "cssPays")
      .attr("x", (() => { return paysDefaut === 'Republique democratique du Congo' ? 1050 : 650}))
      .attr("y", 150)
      .style("text-anchor", "end")
      .html(paysDefaut);

    // GESTION DES COULEURS
    var myColor = d3.scaleOrdinal()
      .domain(allCause)
      .range(["#EFEA5A","#0DB39E","#2C699A","#B9E769","#F29E4C","#54478C"]);
    
    // Gestion du graphe
    // Add X axis --> it is a date format
    var x = d3.scaleTime()
        .domain([new Date(2001, 0, 1), new Date(2019, 0, 1)])
        .range([ 0, widthP]);

    svgP.append("g")
        .attr("transform", "translate(0," + heightP + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain( [0, max])
        .range([ heightP, 0 ]);

    svgP.append("g")
        .call(d3.axisLeft(y));

    var tooltipP = d3.select("#graphePays")
        .append("div")
        .attr("class", "tooltip")
    
      // Three function that change the tooltip when user hover / move / leave a cell

    // Add the lines
    var lineP = d3.line()
        .x(function(d) { return x(new Date (d.annee, 0, 1)) })
        .y(function(d) { return y(d.perte_surface_ha) })
    svgP.selectAll("myLines")
      .data(csvDataPays)
      .enter()
      .append("path")
      .attr("class", function(d){return d.name[4] })
        .attr("d", function(d){ return lineP(d.values) } )
        .attr("stroke", function(d){ return myColor(d.name) })
        .style("stroke-width", 4)
        .style("fill", "none")
    
    // Add the points
    svgP
        // First we need to enter in a group
        .selectAll("myDots")
        .data(csvDataPays)
        .enter()
          .append('g')
          .style("fill", function(d){ return myColor(d.name) })
          .attr("class", function(d){ return d.name[4] })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function(d){ return d.values })
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(new Date (d.annee, 0, 1)) } )
          .attr("cy", function(d) { return y(d.perte_surface_ha) } )
          .attr("r", 7)
          .attr("stroke", "white")
        .on('mouseover', function(event,d) {
            //console.log(event.selection)
           
            tooltipP.style("visibility", "visible")
        })
        .on('mousemove', function(event, d) {
            // on recupere la position de la souris
            // on affiche le toolip
            tooltipP
            // on positionne le tooltip en fonction 
                // de la position de la souris
                .style("left", (event.pageX) + 28 + "px")
                .style("top", (event.pageY) - 28 + "px")
                // on recupere le nom de l'etat 
                .html(paysDefaut + " - " + d.cause + "<br>" + d.annee + "<br>" + parseInt(d.perte_surface_ha) + " ha");
        })
        .on('mouseout', function() {
            // on cache le toolip
            tooltipP.style("visibility", "hidden")
        })
    
    svgP
        .selectAll("myLegend")
        .data(csvDataPays)
        .enter()
            .append('g')
            .append("text")
                .attr('x', 1080)
                .attr('y', function(d,i) { return 30 + i*40})
                .text(function(d) { return d.name; })
                .style("fill", function(d){ return myColor(d.name) })
                .style("font-size", 15)
            .on("click", function(event, d){
                // is the element currently visible ?
                currentOpacity = d3.selectAll("." + d.name[4]).style("opacity")
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + d.name[4]).transition().style("opacity", currentOpacity == 1 ? 0:1)
      
            })
    svgP.selectAll("mydots")
        .data(csvDataPays)
            .enter()
            .append("circle")
              .attr("cx", 1060)
              .attr("cy", function(d,i){ return 25 + i*40}) // 100 is where the first dot appears. 25 is the distance between dots
              .attr("r", 7)
              .style("fill", function(d){ return myColor(d.name) })
}