console.log("Assignment 4-B");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');


//Scales
var scaleX = d3.scale.linear().domain([1960,2015]).range([0,width]),
    scaleY = d3.scale.linear().domain([0,11000000]).range([height,0]);

//Axis
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d') ); //https://github.com/mbostock/d3/wiki/Formatting
var axisY = d3.svg.axis()
    .orient('right')
    .tickSize(width)
    .scale(scaleY);

//Draw axes
plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+height+')')
    .call(axisX);
plot.append('g').attr('class','axis axis-y')
    .call(axisY);

    //line generator
var line = d3.svg.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleY(d.value)})
    .interpolate('basis')


//Start importing data
queue()
    .defer(d3.csv,'data/fao_combined_world_1963_2013.csv',parse)
    .defer(d3.csv,'data/metadata.csv',parseMetadata)
    .await(dataLoaded)

function parse(d){

    //Eliminate records for which gdp per capita isn't available

    //Check "primary completion" and "urban population" columns
    //if figure is unavailable and denoted as "..", replace it with undefined
    //otherwise, parse the figure into numbers
    return {
        item: d.ItemName,
        year: +d.Year,
        value: +d.Value
    };



}

function parseMetadata(d){
}

function dataLoaded(error, data, metadata){

console.log(data);

    //data --> 102 element array with all item, year and value
    //creates objects with objects within grouped by date of flight
    var nestedData = d3.nest()
        .key(function(d){
            //return d.year
            return d.item
        })
        .entries(data)

    console.log(nestedData);

    
    nestedData.forEach(function(t){
        
        console.log(t.key);
       
          
        plot.append('path')
            .attr('class', function(){
                if(t.key=='Tea'){
                    return 'data-line tea-data-line'
                } else {
                    return 'data-line coffee-data-line'
                }
            })
            .datum(t.values)
            .attr('d', line)
            .call(attachTooltip)


        /*plot.selectAll('drink-line')
        .data(data)
        .enter()
        .append('circle')
        .attr('class','drink-line')
        .attr('cx',function(d){return scaleX(d.year)})
        .attr('cy',function(d){return scaleY(d.value)})
        .attr('r',4)
        .style('fill-opacity',.6);*/

        /*var plotLine = d3.selectAll('path') //yields a selection of 0 <path> elements
            .data(nestedData) //joins to an array of two objects
            .enter()
            .append('path') //creates two new <path> elements as the enter set
            .attr('class', function(input){return input.key}) //each element will have class of either "coffee" or "tea"

        plotLine
            .attr('d', function(item){
                return line(item);
            })
            .attr('stroke-width', '2px')
            .attr('stroke', 'blue');

        /*values is the way to find the array nested in the object identified by key
        t.averageFare = d3.mean(t.values, function(flight) {
                return flight.price
        })

        console.log('avg fare for '+t.key+ ' is '+t.averageFare);*/
    })

    /*//SORT nestedData

    nestedData.sort(function(a,b){
        return b.date-a.date;
    })*/

  


    //Do the easy stuff first
    /*plot.selectAll('flight')
        .data(data)
        .enter()
        .append('circle')
        .attr('class','flight')
        .attr('cx',function(d){return scaleX(d.year)})
        .attr('cy',function(d){return scaleY(d.value)})
        .attr('r',4)
        .style('fill-opacity',.6);*/

    /*var timeSeries = 
        d3.selectAll('path') //yields a selection of 0 <path> elements
        .data(data) //joins to an array of two objects
        .enter()
        .append('path') //creates two new <path> elements as the enter set
        .attr('class', function(item){return item.key}) //each element will have class of either "coffee" or "tea"*/
}

function attachTooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            
            tooltip
                .transition()
                .duration(100)
                .style('opacity',1);

            tooltip.select('#item').html(d.item);
            tooltip.select('#year').html(d.year);
            tooltip.select('#value').html(d.value);
        })
        .on('mousemove',function(){
            var xy = d3.mouse(canvas.node());
            
            var tooltip = d3.select('.custom-tooltip');
            
            tooltip
                .style('left',xy[0]+15+'px')
                .style('top',(xy[1]+15)+'px');
        })
        .on('mouseleave',function(){
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .duration(500)
                .style('opacity',0);
        })
}


