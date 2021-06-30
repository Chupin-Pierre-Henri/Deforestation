//Quelques fonction utiles

(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("d3-scale")) :
  typeof define === "function" && define.amd ? define(["exports", "d3-scale"], factory) :
  (factory(global.d3 = global.d3 || {}, global.d3));
}(this, function(exports, d3Scale) {
  'use strict';

  function square(x) {
    return x * x;
  }

  function radial() {
    let linear = d3Scale.scaleLinear();

    function scale(x) {
      return Math.sqrt(linear(x));
    }

    scale.domain = function(_) {
      return arguments.length ? (linear.domain(_), scale) : linear.domain();
    };

    scale.nice = function(count) {
      return (linear.nice(count), scale);
    };

    scale.range = function(_) {
      return arguments.length ? (linear.range(_.map(square)), scale) : linear.range().map(Math.sqrt);
    };

    scale.ticks = linear.ticks;
    scale.tickFormat = linear.tickFormat;

    return scale;
  }

  exports.scaleRadial = radial;

  Object.defineProperty(exports, '__esModule', {value: true});
}));

//Debut graph

var width2014 = 400, height2014 = 350;
d3.select("#grapheTotal2014")
  .append("svg")
  .attr("id","svgComparatifPaysCause2014")
  .attr("width", "100%")
  .attr("height", height2014)
  //.attr("viewBox", [0,0,800,700])
  .attr("viewBox", [300,-20,200,500])
  .attr("font-size","0.9rem")

var svg2014 = d3.select("#svgComparatifPaysCause2014"),
// width2014 = +svg2014.attr("width2014"),
// height2014 = +svg2014.attr("height2014"),
innerRadius2014 = 100,
outerRadius2014 = Math.min(width2014, height2014),
g2014 = svg2014.append("g").attr("transform", "translate(" + width2014 + "," + height2014 + ")");

var x2014 = d3.scaleBand()
.range([0, 2 * Math.PI]);

var y2014 = d3.scaleRadial()
.range([innerRadius2014, outerRadius2014]);

var z2014 = d3.scaleOrdinal()
.range(["#0DB39E","#B9E769","#F29E4C","#2C699A","#EFEA5A","#54478C"]);

d3.csv("https://raw.githubusercontent.com/pltreger/Deforestation/maria/data/perte_couverture_par_pays_par_causes.csv", function(data) {
total = 0;
if (data.annee == "2014")
  return{
      pays: data.pays,
      perte_surface_ha : data.perte_surface_ha,
      cause : data.cause
  }

}).then( function( data) {

for (i = 0; i < data.length; ++i) {
data[i]["Urbanisation"] = 0;
data[i]["Agriculture"] = 0;
data[i]["Deforestation due aux produits de base"] = 0;
data[i]["Feu de foret"] = 0;
data[i]["Foresterie"] = 0;
data[i]["Autres"] = 0;

if (data[i].cause == "Urbanisation")
    data[i]["Urbanisation"] =  +data[i].perte_surface_ha;
    
if (data[i].cause == "Agriculture")
    data[i]["Agriculture"] = +data[i].perte_surface_ha;

if (data[i].cause == "Deforestation due aux produits de base")
    data[i]["Deforestation due aux produits de base"] = +data[i].perte_surface_ha;

if (data[i].cause == "Feu de foret")
    data[i]["Feu de foret"] = +data[i].perte_surface_ha;

if (data[i].cause == "Foresterie")
    data[i]["Foresterie"] = +data[i].perte_surface_ha;

if (data[i].cause == "Autres")
    data[i]["Autres"] = +data[i].perte_surface_ha;

delete data[i]["cause"];
delete data[i]["perte_surface_ha"];
}

pays = ["Argentine", "Australie", "Bolivie", "Bresil", "Canada", "Chine", "Colombie", "etats-Unis", "Indonesie", "Madagascar", "Malaisie", "Mexique", "Myanmar", "Nigeria", "Paraguay", "Perou", "Republique democratique du Congo", "Russie", "Suede", "Tanzanie"]
parsedData = []
for (j = 0; j < pays.length; ++j) {
  let newData = []
  // console.log(data);
  for (k = 0; k < data.length; ++k) {
      //console.log(data[k]);
      if (filterCriteria(data[k]))
          newData.push(data[k]);
  }

  function filterCriteria(d) {
      return d.pays === pays[j];
  }
  if (newData[0].pays == "Republique democratique du Congo")
      obj = {"pays": "RDC"}
  else
      obj = {"pays": newData[0].pays}
  obj.total = 0;

  for (i = 0; i < newData.length; ++i) {

      if (newData[i].Urbanisation != 0){
          obj["Urbanisation"] = newData[i].Urbanisation;
          obj.total += newData[i].Urbanisation;
      }
          
      if (newData[i].Agriculture != 0){
          obj["Agriculture"] = newData[i].Agriculture;
          obj.total += newData[i].Agriculture;
      }
          
      if (newData[i]["Deforestation due aux produits de base"] != 0){
          obj["Deforestation due aux produits de base"] = newData[i]["Deforestation due aux produits de base"];
          obj.total += newData[i]["Deforestation due aux produits de base"];
      }
          
      if (newData[i]["Feu de foret"] != 0){
          obj["Feu de foret"] = newData[i]["Feu de foret"];
          obj.total += newData[i]["Feu de foret"];
      }
          
      if (newData[i].Foresterie != 0){
          obj["Foresterie"] = newData[i].Foresterie;
          obj.total += newData[i].Foresterie;
      }
          
      if (newData[i].Autres != 0){
          obj["Autres"] = newData[i].Autres;
          obj.total += newData[i].Autres;
      }
  }
  parsedData.push(obj)
  
}
parsedData.columns = ["pays", "Autres", "Foresterie", "Feu de foret", "Deforestation due aux produits de base", "Agriculture", "Urbanisation"] 
//console.log(dataParsed)

weave(parsedData, function(a, b) { return b["total"] -  a["total"]; });
x2014.domain(parsedData.map(function(d) { return d.pays; }));
y2014.domain([0, d3.max(parsedData, function(d) { return d.total; })]);
z2014.domain(parsedData.columns.slice(1));

var tooltip2014 = d3.select("#grapheTotal2014")
        .append("div")
        .attr("class", "tooltip")

g2014.append("g")
.selectAll("g")
.data(d3.stack().keys(parsedData.columns.slice(1))(parsedData))
.enter().append("g")
.attr("fill", function(d) { return z2014(d.key); })
.selectAll("path")
.data(function(d) { return d; })
.enter().append("path")
.attr("d", d3.arc()
    .innerRadius(function(d) { return y2014(d[0]); })
    .outerRadius(function(d) { return y2014(d[1]); })
    .startAngle(function(d) { return x2014(d.data.pays); })
    .endAngle(function(d) { return x2014(d.data.pays) + x2014.bandwidth(); })
    .padAngle(0.01)
    .padRadius(innerRadius2014))
    .on('mouseover', function(event,d) {
      //console.log(event.selection)
       tooltip2014.style("visibility", "visible")
     })
     .on('mousemove', function(event, d) {
       tooltip2014
         .style("left", (event.pageX) + 28 + "px")
         .style("top", (event.pageY) - 28 + "px")
         .html(d.data.pays + "<br>" + parseInt(d.data.total) + " ha");
     })
     .on('mouseout', function() {
       tooltip2014.style("visibility", "hidden")
     });

/*var label2014 = g2014.append("g")
.selectAll("g")
.data(parsedData)
.enter().append("g")
.attr("text-anchor", "middle")
.attr("transform", function(d) { return "rotate(" + ((x2014(d.pays) + x2014.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius2014 + ",0)"; });

label2014.append("line")
.attr("x2", -5)
.attr("stroke", "#000");

label2014.append("text")
.attr("transform", function(d) { return (x2014(d.pays) + x2014.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
.text(function(d) { return d.pays; });*/

var yAxis2014 = g2014.append("g")
.attr("text-anchor", "end");

var yTick2014 = yAxis2014
.selectAll("g")
.data(y2014.ticks(7).slice(1))
.enter().append("g");

yTick2014.append("circle")
.attr("fill", "none")
.attr("stroke", "#000")
.attr("stroke-opacity", 0.5)
.attr("r", y2014);

yTick2014.append("text")
.attr("x", -6)
.attr("y", function(d) { return -y2014(d); })
.attr("dy", "0.35em")
.attr("fill", "none")
.attr("stroke", "#fff")
.attr("stroke-linejoin", "round")
.attr("stroke-width2014", 3)
.text(y2014.tickFormat(10, "s"));

yTick2014.append("text")
.attr("x", -6)
.attr("y", function(d) { return -y2014(d); })
.attr("dy", "0.35em")
.text(y2014.tickFormat(10, "s"));

yAxis2014.append("text")
.attr("x", -6)
.attr("y", function(d) { return -y2014(y2014.ticks(10).pop()); })
.attr("dy", "-1em")
.text("Perte en surface");

/*var legend = g.append("g")
.selectAll("g")
.data(parsedData.columns.slice(1).reverse())
.enter().append("g")
.attr("transform", function(d, i) { return "translate(-40," + (i - (parsedData.columns.length - 1) / 2) * 20 + ")"; });

legend.append("rect")
.attr("width2014", 18)
.attr("height2014", 18)
.attr("fill", z);

legend.append("text")
.attr("x", 24)
.attr("y", 9)
.attr("dy", "0.35em")
.text(function(d) { return d === "Deforestation due aux produits de base" ? "Deforestation produits base" : d;  });*/
});

function weave(array, compare) {
var i = -1, j, n = array.sort(compare).length, weave = new Array(n);
while (++i < n) weave[i] = array[(j = i << 1) >= n ? (n - i << 1) - 1 : j];
while (--n >= 0) array[n] = weave[n];
}



