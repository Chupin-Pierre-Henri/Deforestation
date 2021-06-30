const marginDB = {top: 20, right: 40, bottom: 60, left: 70},
    widthDB = 1100 - marginDB.left - marginDB.right,
    heightDB = 510 - marginDB.top - marginDB.bottom,
    keys = ["Agriculture", "Autres", "Deforestation due aux produits de base", "Foresterie", "Feu de foret", "Urbanisation"],
    colorsDB = ["#EFEA5A","#0DB39E","#2C699A","#B9E769","#F29E4C","#54478C"],
    legendCellSize = 20,
    tooltipWidth = 210;

const svgDB = d3.select("#grapheDeforestationBis").append("svg")
    .attr("id", "svg")
    .attr("width", "100%")
    .attr("height", heightDB + marginDB.top + marginDB.bottom)
    .attr("viewBox", [300, 0, 500, 500])
    .append("g")
    .attr("transform", "translate(" + marginDB.left + "," + marginDB.top + ")");

var tooltipDBDB = d3.select("#grapheDeforestationBis")
    .append("div")
    .attr("class", "tooltipDB")

d3.csv("https://raw.githubusercontent.com/pltreger/Deforestation/main/data/perte_couverture_mondiale_par_causes.csv").then(function(dataBase) { 
    //console.log(data)

    var goodData = []
    for(var i = 2001; i < 2020; i++) {
        let gd = {date: String(i), "Agriculture": null, "Autres": null, "Deforestation due aux produits de base": null, "Foresterie": null, "Feu de foret": null, "Urbanisation": null, Total: 0}
        for(var j = 0; j < dataBase.length; j++) {
            if(dataBase[j].annee === String(i)) {
                gd.Total += dataBase[j].perte_surface_ha
                key = dataBase[j].cause
                gd[key] = dataBase[j].perte_surface_ha
            }
        }
        goodData.push(gd)
    }

    var stack = d3.stack()
    	.keys(keys)
    	.order(d3.stackOrderNone)
    	.offset(d3.stackOffsetNone);

    var series = stack(goodData);

    const xDB = d3.scaleBand()
        .domain(goodData.map(d => d.date).sort())
    	.range([0, widthDB])
    	.padding(0.1);

    const yDB = d3.scaleLinear()
        .domain([0, d3.max(series[series.length - 1], d => d[1])])
        .range([heightDB, 0]);
        
    // Sur l'axe horizontal, on filtre les dates afficher
    const xAxis = d3.axisBottom(xDB)
        .tickValues(xDB.domain());

    svgDB.append("g")
        .attr("class", "x axis")
      	.attr("transform", "translate(0," + heightDB + ")")
      	.call(xAxis)
        .selectAll("text")	
        .style("text-anchor", "middle");

    svgDB.append("g")
        .attr("class", "y axis")
       	.call(d3.axisLeft(yDB))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")

    let groups = svgDB.selectAll("g.biberon")
        .data(series)
        .enter()
        .append("g")
        .style("fill", (d, i) => colorsDB[i]);
        

    let rect = groups.selectAll("rect")
        .data(d => d)
        .enter()
            .append("rect")
            .attr("x", d => xDB(d.data.date))
            .attr("width", xDB.bandwidth())
            .attr("y", d => yDB(d[1]))
            .attr("height", d => heightDB - yDB(d[1] - d[0]));
            

    addLegend(colorsDB);
    //let tooltipDB = addTooltipDB(keys.length);
    //handleMouseEvent(goodData, xDB, yDB, tooltipDB);
})

function addLegend(colorsDB) {
    var reverseColors = colorsDB.reverse(); // Pour présenter les catégories dans le même sens qu'elles sont utilisées
    var reverseKeys = keys.reverse();
        
    var legendDB = svgDB.append('g')
        .attr('transform', 'translate(10, 20)'); // Représente le point précis en haut à gauche du premier carré de couleur
                
    // Pour chaque couleur, on ajoute un carré toujours positionné au même endroit sur l'axe X et décalé en fonction de la 
    // taille du carré et de l'indice de la couleur traitée sur l'axe Y
    legendDB.selectAll()
        .data(reverseColors)
        .enter()
        .append('rect')
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .attr('y', (d,i) => i * legendCellSize)
        .style("fill", d => d);
            
        // On procéde de la même façon sur les libellés avec un positionement sur l'axe X de la taille des carrés 
        // à laquelle on rajoute 10 px de marge
    legendDB.selectAll()
        .data(reverseKeys)
        .enter().append('text')
        .attr("transform", (d,i) => "translate(" + (legendCellSize + 10) + ", " + (i * legendCellSize) + ")")
        .attr("dy", legendCellSize / 1.6) // Pour centrer le texte par rapport aux carrés
        .style("font-size", "13px")
        .style("fill", "grey")
        .text(d => d);
}

/*function addTooltipDB(nbCategories) {
    let values = d3.range(1, nbCategories + 1);
    let band = tooltipWidth / values.length;

    var tooltipDB = svgDB.append("g") // On regroupe tout le tooltipDB et on lui attribut un ID
        .attr("id", "tooltip")
        .style("opacity", 0);
        
    tooltipDB.append("rect")
        .attr("x", 0)
    	.attr("y", 0)
    	.attr("width", tooltipWidth)
    	.attr("height", 80)
        .style("opacity","0.9")
        .style("fill", "white")
        .style("stroke-width","1")
        .style("stroke","#929292")
        .style("padding", "1em");
        
    tooltipDB.append("line") // La ligne entre le titre et les valeurs
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 160)
        .attr("y2", 25)
        .style("stroke","#929292")
        .style("stroke-width","0.5")
        .attr("transform", "translate(0, 5)");
        
    var textDB = tooltipDB.append("text") // Ce TEXT contiendra tous les TSPAN
        .style("font-size", "13px")
        .style("fill", "grey")
        .attr("transform", "translate(0, 20)");
        
    textDB.append("tspan") // Le titre qui contient la date avec définition d'un ID
        .attr("x", tooltipWidth / 2)
        .attr("y", 0)
        .attr("id", "tooltipDB-date")
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "16px");
        
    textDB.selectAll("text") // Le nom des catégories, ici "1", "2"...
  		.data(values)
  		.enter().append("tspan")
            .attr("x", d => band / 2 + band * (d - 1))
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("fill", "grey")
            .text(d => d);

    textDB.selectAll("text") // La valeur des catégories avec définition d'un ID : "tooltipDB-1", "tooltipDB-2"...
  		.data(values)
  		.enter().append("tspan")
            .attr("x", d => band / 2 + band * (d - 1))
            .attr("y", 45)
            .attr("id", d => "tooltipDB-" + d)
            .attr("text-anchor", "middle")
            .style("fill", "grey")
            .style("font-size", "0.8em")
            .style("font-weight", "bold");

    console.log(tooltipDB)
        
    return tooltipDB;
}

function buildMousePolygon(data, x, y) {
    console.log('kikou', data)
    const tmpline = d3.line()
       	.x(d => x.bandwidth() + x(d.date))
    	.y(d => y(d.value))
        .curve(d3.curveStepBefore); // Nous utilisons une courbe sous forme d'escalier pour coller à nos barres

    let tmpArray = [];
    for (let i = 0; i < data.length; ++i) {
        tmpArray.push({"date": data[i].date, "value": data[i].Total});
    }

    // Création d'un groupe qui n'est pas ajouté à la page
    const detachedGroup = d3.create("g");

    detachedGroup.append("path")
       	.datum(tmpArray)
       	.attr("d", tmpline);

    // Le path ajouté ci-dessous ne forme pas un chemin fermé sur lui même, nous le complétons avec ce chemin construit manuellement
    // https://www.dashingd3js.com/svg-paths-and-d3js
    let strPath = "M " + x.bandwidth() + " " + y(data[0].Total) + " H 0 V " + height + " H " + width + " V " + y(data[data.length - 1].Total);

    detachedGroup.append("path")
        .attr("d", strPath);
        
    // Réunion de tous les path en un seul
    var mergedPath = "";
    detachedGroup.selectAll("path")
        .each(function() { mergedPath += d3.select(this).attr("d"); });
    
    return mergedPath;
}

function handleMouseEvent(data, x, y, tooltipDB) {
    console.log('kikou', data)
    let mergedPath = buildMousePolygon(data, x, y); // construction du polygone
        
    svgDB.append("path")
  		.attr("d", mergedPath)
        .style("opacity", 0) // Ajout du polygone avec une opacity de 0
        .on("mouseover", function() {
            tooltipDB.style("opacity", 1);
        })
        .on("mouseout", function() {
            tooltipDB.style("opacity", 0);
        })
        .on("mousemove", function() {
            // D3JS ne fournit pas de fonction pour retrouver les données associées à la position de la souris comme il le fait les courbes.
            // Il faut donc procéder par calcul pour retrouver quelle donnée est associée à la position de la souris.
            // https://stackoverflow.com/questions/38633082/d3-getting-invert-value-of-band-scales
            let mouse = d3.mouse(this),
                i = Math.floor((mouse[0] / x.step())), // step = bandWidth + paddingInner : https://observablehq.com/@d3/d3-scaleband
                d = data[i];
            if (d === undefined) { return ; }
            
            // On empèche ici le tooltipDB de sortir du graphique lorsque la souris se rapproche des bords
            let boundedX = mouse[0] < (tooltipDBWidth / 2) ? 0 : mouse[0] > (width - (tooltipDBWidth / 2)) ? width - tooltipDBWidth : mouse[0] - (tooltipDBWidth / 2); 
            tooltipDB.attr("transform", "translate(" + boundedX + "," + (mouse[1] - 90) + ")");
        
            tooltipDB.select('#tooltipDB-date')
               	.text("Biberons du " + d.date);
            for (let i = 1; i <= 9; i++) {
                tooltipDB.select('#tooltipDB-' + i)
               		.text(d["Biberon " + i]);
            }
        });
}*/