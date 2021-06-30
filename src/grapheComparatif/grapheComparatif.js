

function colorFilter(d){
  if(d.pays === "Russie") return "#F1C453";
  else if(d.pays === "Bresil") return "#83E377";
  else if(d.pays === "Canada") return "#048BA8";
  else if(d.pays === "Etats-Unis") return "#EFEA5A";
  else if(d.pays === "Australie") return "#16DB93";
  else if(d.pays === "Republique democratique du Congo") return "#F29E4C";
  else if(d.pays === "Indonesie") return "#2C699A";
  else if(d.pays === "Bolivie") return "#B9E769";
  else if(d.pays === "Chine") return "#0DB39E";
  else if(d.pays === "Malaisie") return "#54478C";
  else if(d.pays === "Colombie") return "#16DB93";
  else if(d.pays === "Paraguay") return "#83E377";
  else if(d.pays === "Argentine") return "#2C699A";
  else if(d.pays === "Suede") return "#EFEA5A";
  else if(d.pays === "Myanmar") return "#0DB39E";
  else if(d.pays === "Cote d Ivoire") return "#54478C";
  else if(d.pays === "Madagascar") return "#B9E769";

}


function drawGrahpics() {

  var marginC = { top: 10, right: 30, bottom: 20, left: 30 },
    widthC = 1000 - marginC.left - marginC.right,
    heightC = 500 - marginC.top - marginC.bottom;

  // append the svgC object to the body of the page
  var svgC = d3
    .select("#grapheComparatif")
    .append("svg")
    .attr("width", "100%")
    .attr("height", heightC + marginC.top + marginC.bottom -10)
    .attr("viewBox", [350, 0, 600, 500])
    .append("g")
    .attr("transform", "translate(" + marginC.left + "," + marginC.top + ")");

  var tickDuration = 1500;
  var top_n = 10;

  let barPadding = (heightC - (marginC.bottom + marginC.top)) / (top_n * 5);

  couleurs = ["#F1C453", "#83E377", "#048BA8", "#EFEA5A", "#16DB93", "#F29E4C", "#2C699A", "#B9E769", "#0DB39E", "#54478C"];

  let annee = 2001;
  d3.csv("https://raw.githubusercontent.com/pltreger/Deforestation/main/data/perte_couverture_par_pays.csv").then(function (data) {
    //Récupérations données 2001
    let donneesAnnee = data
      .filter((d) => d.annee == annee && !isNaN(d.annee))
      .sort((a, b) => b.perte_surface_ha - a.perte_surface_ha)
      .slice(0, top_n);
    donneesAnnee.forEach((d, i) => (d.rank = i));


    //Affichage graphique pour 2001
    let xC = d3
      .scaleLinear()
      .domain([0, donneesAnnee[0].perte_surface_ha])
      .range([marginC.left, 1200]);

    let yC = d3
      .scaleLinear()
      .domain([top_n, 0])
      .range([heightC - marginC.bottom, marginC.top]);

    let xAxisC = d3
      .axisTop()
      .scale(xC)
      .ticks(widthC > 500 ? 5 : 2)
      .tickSize(-(heightC.top - marginC.bottom))
      .tickFormat((d) => d3.format(",")(d));
    
    let gxAxisC = svgC
      .append("g")
      .attr("class", "x xAxisC");

    svgC
      .selectAll("rect.barComparatif")
      .data(donneesAnnee, (d) => d.pays)
      .enter()
      .append("rect")
      .attr("class", "barComparatif")
      .attr("x", xC(0) + 1)
      .attr("width", (d) => xC(d.perte_surface_ha) - xC(0) - 1)
      .attr("y", (d) => yC(d.rank) + 5 )
      .attr("height", yC(1) - yC(0) - barPadding)
      .style("fill", (d)=>colorFilter(d));
    svgC
      .selectAll("text.labelComparatif")
      .data(donneesAnnee, (d) => d.pays)
      .enter()
      .append("text")
      .attr("class", "labelComparatif")
      .attr("x", (d) => xC(d.perte_surface_ha) - 8)
      .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1 )
      .style("text-anchor", "end")
      .html((d) => d.pays);

    svgC
      .selectAll("text.valueLabelComparatif")
      .data(donneesAnnee, (d) => d.pays)
      .enter()
      .append("text")
      .attr("class", "valueLabelComparatif")
      .attr("x", (d) => xC(d.perte_surface_ha) + 5)
      .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1 )
      .text((d) => d3.format(",.0f")(d.perte_surface_ha));

    let texteAnnee = svgC
      .append("text")
      .attr("class", "anneeComparatif")
      .attr("x", widthC)
      .attr("y", heightC - 100)
      .style("text-anchor", "end")
      .html(~~annee);


       //Fonction qui va changer les valeurs pour chaque année
       let ticker = d3.interval((e) => {
        let donneesAnneePrecedent = donneesAnnee;
        donneesAnnee = data
          .filter((d) => d.annee == annee && !isNaN(d.annee))
          .sort((a, b) => b.perte_surface_ha - a.perte_surface_ha)
          .slice(0, top_n);
        donneesAnnee.forEach((d, i) => (d.rank = i));

        xC.domain([0, donneesAnnee[0].perte_surface_ha]);
        
        gxAxisC
        .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .call(xAxisC);

        let barsC = svgC
          .selectAll(".barComparatif")
          .data(donneesAnnee, (d) => d.pays);

        barsC
          .enter()
          .append("rect")
          .attr("class", "barComparatif")
          .attr("x", xC(0) + 1)
          .attr("width", (d) => xC(d.perte_surface_ha) - xC(0) - 1)
          .attr("y", (d) => yC(d.rank) + 5 )
          .attr("height", yC(1) - yC(0) - barPadding)
          .style("fill", (d)=>colorFilter(d));

        barsC
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("width", (d) => xC(d.perte_surface_ha) - xC(0) - 1)
          .attr("y", (d) => yC(d.rank) + 5 );

        barsC
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("width", (d) => xC(d.perte_surface_ha) - xC(0) - 1)
          .attr("y", (d) => yC(top_n + 1) + 5 )
          .remove();

        let labelsC = svgC
          .selectAll(".labelComparatif")
          .data(donneesAnnee, (d) => d.pays);

        labelsC
          .enter()
          .append("text")
          .attr("class", "labelComparatif")
          .attr("x", (d) => xC(d.perte_surface_ha) - 8)
          .attr("y", (d) => yC(top_n + 1) + 5 + (yC(1) - yC(0)) / 2 )
          .style("text-anchor", "end")
          .html((d) => d.pays)
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1 );

        labelsC
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("x", (d) => xC(d.perte_surface_ha) - 8)
          .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1);

        labelsC
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("x", (d) => xC(d.perte_surface_ha) - 8)
          .attr("y", (d) => yC(top_n + 1) + 5)
          .remove();

        let valueLabelsC = svgC
          .selectAll(".valueLabelComparatif")
          .data(donneesAnnee, (d) => d.pays);

        valueLabelsC
          .enter()
          .append("text")
          .attr("class", "valueLabelComparatif")
          .attr("x", (d) => xC(d.perte_surface_ha) + 5)
          .attr("y", (d) => yC(top_n + 1) + 5)
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1);

        valueLabelsC
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("x", (d) => xC(d.perte_surface_ha) + 5)
          .attr("y", (d) => yC(d.rank) + 5 + (yC(1) - yC(0)) / 2 + 1)
          .text((d) => d3.format(",.0f")(d.perte_surface_ha));
          /*.tween("text", function (d) {
            let i = d3.interpolate(
              donneesAnneePrecedent.forEach((dPrecedent) => {
                if (d.pays === dPrecedent.pays) {
                  return dPrecedent.perte_surface_ha;
                }
              }),
              d.perte_surface_ha
            );
            return function (t) {
              this.textContent = d3.format(",")(i(t));
            };
          });*/


        valueLabelsC
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr("x", (d) => xC(d.perte_surface_ha) + 5)
          .attr("y", (d) => yC(top_n + 1) + 5)
          .remove();

        texteAnnee.html(~~annee);

        if (annee === 2019) ticker.stop();
        annee = annee + 1;
      }, tickDuration);
  });
}

drawGrahpics();
  
d3.select("#replay").on("click", function () {
  location.reload();
});
