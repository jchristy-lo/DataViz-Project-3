// window.addEventListener("load",run);

$("document").ready(function() {
    run();

    // Handler for question selection
    $("#question").change(function() {
        console.log($("#question option:selected").val());
        GLOBAL.activeQ = $("#question option:selected").val();
        updateOverview();
    });

    // Handler for demographic selection
    $(".filter").change(function() {
        updateOverview();
    });

    // Handler for question selection
    $("#changeOtherQ").change(function() {
        console.log($("#changeOtherQ option:selected").val());
        GLOBAL.filterQ = $("#changeOtherQ option:selected").val();
        populateAnswers();
        updateOverview();
    });

    // Handler for answer selection
    $("#changeAnswer").change(function() {
        console.log($("#changeAnswer option:selected").val());
        GLOBAL.filterAnswer = $("#changeAnswer option:selected").text();
        updateOverview();
    });
});
      
function run () {
    initializeView();
    setupOverview();
    getDataRows(function(data) {
	   GLOBAL.data = data;
	   populateSelectors (data);
	   updateOverview();
    });
}

var GLOBAL = { 
        data: [],
		color: ["cyan","magenta","yellow","white","blue","red","green"],
		countries: ["United States", "Canada","Britain",
    	"France","Germany","Italy","Spain","Greece","Poland",
    	"Czech Republic","Russia","Turkey","Egypt","Jordan", "Lebanon",
    	"Tunisia", "Israel", "Australia", "China", "Indonesia", "Japan", 
    	"Malaysia", "Pakistan", "Philippines", "South Korea", "Argentina",
    	"Bolivia", "Brazil", "Chile", "El Salvador", "Mexico", "Venezuela",
    	"Ghana", "Kenya", "Nigeria", "Senegal", "South Africa", "Uganda"],
		segments: ["sex","age","job"],
		q1: { tag: "Q1",
			options: ["Satisfied","Dissatisfied","Don't know"]},
	    q4:{ tag: "Q4",
	    	options: ["Very good","Somewhat good","Somewhat bad", 
	    	"Very bad", "Don't know"]},
	    q5:{ tag: "Q5",
	    	options: ["Improve a lot","Improve a little",
	    	"Remain the same", "Worsen a little", "Worsen a lot",
	    	"Don't know"]},
	    q6:{  tag: "Q6",
	    	options: ["Very good","Somewhat good","Somewhat bad", 
	    	"Very bad", "Don't know"]},
	    q7:{  tag: "Q7",
	    	options: ["Improve a lot","Improve a little",
	    	"Remain the same", "Worsen a little", "Worsen a lot",
	    	"Don't know"]},
	    q8:{  tag: "Q8",
	    	options: ["Better off","Worse off","Same", "Don't know"]},
	    q24:{ tag: "Q24",
	    	options: ["Increased","Decreased","Stayed the same",
	    	"Don't know"]},
        activeQ: "q1",
        filterQ: "q1",
        filterAnswer: "All"
}

function populateAnswers () {
    answers_html="<option value=\"all\">All</option>\n";
    for (var i = 0; i < GLOBAL[GLOBAL.filterQ].options.length; i++) {
        answers_html+="<option>"+GLOBAL[GLOBAL.filterQ].options[i]+"</option>\n"
    };
    $("#changeAnswer").html(answers_html);
    GLOBAL.filterAnswer = "All";
}

function populateSelectors (data) { 
    var sex = d3.set();
    var ages = d3.set();
    var marStat = d3.set();
    var empStat = d3.set();

    data.forEach(function(r) {
	sex.add(r.SEX);
	ages.add(r.AGE);
	marStat.add(r.Q187);
	empStat.add(r.Q181);
    });
    d3.select("#select-sex")
	.selectAll("option")
	.data(sex.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});

    d3.select("#select-age")
	.selectAll("option")
	.data(ages.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});

    d3.select("#select-mar")
	.selectAll("option")
	.data(marStat.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});

	d3.select("#select-emp")
	.selectAll("option")
	.data(empStat.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});
}

//Generic filter function
function filter (data,pred) {
    filtered = [];
    for (var i = 0; i < data.length; i++) {
        if (pred(data[i])) {
            filtered.push(data[i]);
        }
    };
    return filtered;
}

function questionAnswerPredicateGen (question, answer) {
    return function (row) {
        return row[question.tag] == answer;
    }
}

function demographicPredicateGen () {
    var sexes = $("#select-sex").val();
    var ages = $("#select-age").val();
    var emps = $("#select-emp").val();
    var mars = $("#select-mar").val();
    return function(row) {
        res = 
            (sexes.indexOf(row.SEX) != -1) &&
            (ages.indexOf(row.AGE) != -1) &&
            (emps.indexOf(row.Q181) != -1) &&
            (mars.indexOf(row.Q187) != -1);
        // console.log(res);
        return res;
        
    }
}

function computeSizes (svg) { 
    var height = svg.attr("height");
    var width = svg.attr("width");
    var margin = 30;

    return {height:height,
	    width: width,
	    margin: margin,
	    chartHeight: height-2*margin,
	    chartWidth: width-2*margin}
}    

function initializeView () { 
    populateAnswers();
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
}

function updateOverview () {
    var activeQ = GLOBAL[GLOBAL.activeQ]
	console.log("updateOverview");
    var svg = d3.select("#viz");
    var s = computeSizes(svg);

    svg.selectAll("rect").remove();
    svg.selectAll("text").remove();

    var CCounts = {};
    var counts = newArrayOfArrays(GLOBAL.countries.length,activeQ.options.length);

    GLOBAL.countries.forEach(function (i){
    	CCounts[i]=0;
    });

    var data = GLOBAL.data;
    if (GLOBAL.filterAnswer != "All") {
        data = filter(data, questionAnswerPredicateGen(GLOBAL[GLOBAL.filterQ], GLOBAL.filterAnswer));
    }
    data = filter(data, demographicPredicateGen());
    // console.log(data);

    data.forEach(function(r) {
		for (i = 0; i < GLOBAL.countries.length; i++) {
			if (r["COUNTRY"]===GLOBAL.countries[i]) {
				var bool = 0;
				for (j = 0; j < activeQ.options.length; j++) {
					if(activeQ.options[j]===r[activeQ.tag]){
						bool = 1;
						counts[i][j]+= 1;}
		    	}
		    	if(bool === 0);{counts[i][-1]+= 1;}
		    	CCounts[r["COUNTRY"]] += 1;
			}
		}
	    });

    var svg = d3.select("#viz");

    barWidth = s.chartWidth - s.margin;
    barHeight = s.chartHeight / (1.5 * counts.length - .5);
    var yPos = s.margin;

	for(i=0; i<5; i++){
		svg.append("text")
			.attr("class","label")
			.attr("x", i*0.25*barWidth+80)
			.attr("y", 8)
			.attr("dy","0.3em")
			.style("text-anchor","middle")
			.style("fill","white")
            .style("font-size", "10px")
			.text(i*25+"%"); 

		svg.append("rect")
			.attr("x", i*0.25*barWidth+85)
			.attr("y", 20)
	        .attr("width", 2)
	        .attr("height", s.chartHeight+20)
	        .style("stroke-width", "1px")
	        .style("fill", "white");}

	for(i=0; i<activeQ.options.length; i++){
		svg.append("text")
		.attr("x", i*(1/activeQ.options.length)*barWidth+95)
		.attr("y",20)
		.attr("dy","0.3em")
		.style("text-anchor","right")
		.style("fill",GLOBAL.color[i])
        .style("font-size", "13px")
		.text(activeQ.options[i]); 
	}

    for(i=0; i<counts.length; i++){
    	var xPos = 85;
    	var k = 0;

    	counts[i].forEach(function (j) {
    		svg.append("rect")
	            .attr("x", xPos)
	            .attr("y", yPos)
	            .attr("width", barWidth*j/CCounts[GLOBAL.countries[i]])
	            .attr("height", barHeight)
	            .style("stroke-width", "2px")
	            .style("fill", GLOBAL.color[k]);
            xPos += barWidth *j/CCounts[GLOBAL.countries[i]];
            k += 1;
    	})
    	yPos += barHeight*1.5 ;
    	}

    yPos = s.margin;
	for(i=0; i<counts.length; i++){
		sel.append("text")
			.attr("class","label")
			.attr("x", 10)
			.attr("y", yPos+5)
			.attr("dy","0.3em")
			.style("text-anchor","left")
			.style("fill","white")
            .style("font-size", "11px")
			.text(GLOBAL.countries[i]);
		yPos += barHeight*1.5 ;
	}
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