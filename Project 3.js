window.addEventListener("load",run);
      
function run () {
    initializeView();
    setupOverview();
    getDataRows(function(data) {
	GLOBAL.data = data;
	updateOverview(GLOBAL.q1) });
}

var GLOBAL = { data: [],
		countries: ["United States", "Canada","Britain",
    	"France","Germany","Italy","Spain","Greece","Poland",
    	"Czech Republic","Russia","Turkey","Egypt","Jordan", "Lebanon",
    	"Tunisia", "Israel", "Australia", "China", "Indonesia", "Japan", 
    	"Malaysia", "Pakistan", "Philippines", "South Korea", "Argentina",
    	"Bolivia", "Brazil", "Chile", "El Salvador", "Mexico", "Venezuela",
    	"Ghana", "Kenya", "Nigeria", "Senegal", "South Africa", "Uganda"],
		segments: ["sex","age","job"],
		q1: {options: ["Satisfied","Dissatisfied","Don't know"]},
	    q4:{options: ["Very good","Somewhat good","Somewhat bad", 
	    	"Very bad", "Don't know"]},
	    q5:{options: ["Improve a lot","Improve a little",
	    	"Remain the same", "Worsen a little", "Worsen a lot",
	    	"Don't know"]},
	    q6:{options: ["Very good","Somewhat good","Somewhat bad", 
	    	"Very bad", "Don't know"]},
	    q7:{options: ["Improve a lot","Improve a little",
	    	"Remain the same", "Worsen a little", "Worsen a lot",
	    	"Don't know"]},
	    q8:{options: ["Better off","Worse off","Same", "Don't know"]},
	    q24:{options: ["Increased","Decreased","Stayed the same",
	    	"Don't know"]}
		}

// split data into groups based on 'col' values
// (only process rows satisfying 'pred')

function countSplitByColumn (data,pred,col) { 
    var counts = { };
    var all = 0;
    data.forEach(function(r) {
	if (pred(r)) { 
	    all += 1;
	    c = r[col];
	    if (c in counts) {
		counts[c] += 1;
	    } else {
		counts[c] = 1;
	    }
	}
    });
    return {all:all,counts:counts};
}

function computeSizes (svg) { 
    var height = svg.attr("height");
    var width = svg.attr("width");
    var margin = 50;

    return {height:height,
	    width: width,
	    margin: margin,
	    chartHeight: height-2*margin,
	    chartWidth: width-2*margin}
}    

function initializeView () { 
    var svg = d3.select("#viz");
    var s = computeSizes(svg);

    svg.append("text")
	.attr("id","title")
	.attr("x",s.width/2)
 	.attr("y",s.margin/3)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
}

function setupOverview () { 
    var svg = d3.select("#viz");
    var s = computeSizes(svg);
    var barWidth = s.chartWidth/(2*GLOBAL.countries.length-1);

    // get rid of old view
    svg.selectAll("g").remove();

    sel = svg.selectAll("g")
	.data(GLOBAL.countries)
	.enter().append("g")

    sel.append("rect")
	.attr("class","bar")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth; })
	.attr("y",s.height-s.margin)
	.attr("width",barWidth)
	.attr("height",0)

    sel.append("text")
	.attr("class","value")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
 	.attr("y",s.height-s.margin-20)
	.attr("dy","0.3em")
	.style("text-anchor","middle");

    sel.append("text")
	.attr("class","label")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
	.attr("y",s.margin+s.chartHeight+50)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
	.text(function(d) { return d; });
}

function updateOverview (activeQ) {
	console.log("updateOverview");
    var svg = d3.select("#viz");
    var s = computeSizes(svg);

    var COLUMN = GLOBAL.countries;
    var counts = newArrayOfArrays(GLOBAL.q1.options.length,COLUMN.length);
    var total_count = 0;
 
    GLOBAL.data.forEach(function(r) {
		total_count += 1;
		for (i = 0; i < COLUMN.length; i++) {
			if (r["COUNTRY"]===COLUMN[i]) {
				for (j = 0; j < activeQ.options.length; j++) {
		    		counts[j][i]+= 1;
		    	}
			}
		}
	    });

    var yPos = d3.scale.linear() 
	.domain([0,total_count])
	.range([s.height-s.margin,s.margin]);

    var width = d3.scale.linear() 
	.domain([0,total_count])
	.range([0,s.chartHeight]);

    sel = svg.selectAll("g") 
	.data(counts[0]);

    sel.select(".bar") 
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d); }) 
	.attr("height",function(d) { return height(d); });

    sel.select(".value") 
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d) - 20; }) 
	.text(function(d) { return Math.round(100*d/total_count)+"%"; });
}

function newZeroArray(length) {
    var array = [];
    var i = 0;
    while (i < length) {array[i++] = 0;}
    return array;
}

function newArrayOfArrays(num,length){
	var array = [];
    var i = 0;
    while (i < num) {array[i++] = newZeroArray(length);}
    return array;
}

function getDataRows (f) {
    d3.csv("keyQs.csv",
	   function(error,data) {
	       f(data);
	   });
}