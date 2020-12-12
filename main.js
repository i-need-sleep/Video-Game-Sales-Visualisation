d3.csv('cleaned.csv').then(function(data){
    // Setting up the data
    data.forEach(function(d){
        d.Rank = +d.Rank;
        d.Year = +d.Year;
        d.NA_Sales = +d.NA_Sales;
        d.EU_Sales= +d.EU_Sales;
        d.JP_Sales = +d.JP_Sales;
        d.Other_Sales = +d.Other_Sales;
        d.Global_Sales = +d.Global_Sales;
        d.Multiplatform = +d.Multiplatform;
        d.Platform = d.Platform;
    })

    let svg = d3.select('svg');

    // Setting up gs
    let main_g = svg.append('g')
        .attr('transform', 'translate(50,100)');

    let sec_g_1 = svg.append("g")
        .attr('transform','translate(1000,20)');

    let sec_g_2 = svg.append("g")
        .attr('transform','translate(1000,270)');

    let sec_g_3 = svg.append("g")
        .attr('transform','translate(1000,550)');

    // Tooltip:
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var div_total = d3.select("body").append("div")
        .attr("class", "tooltip_total")
        .style("opacity", 0);

    var div_pie_detail = d3.select("body").append("div")
        .attr("class", "game_details")
        .style("left", "1000px").style("top","593px");

    var div_pie = d3.select("body").append("div")
        .attr("class", "tooltip_pie")
        .style("opacity", 0);

    // Inputs
    var main_size = document.getElementById("main_size");
    var reset_highlight = document.getElementById("reset");
    var filter_main_select = document.getElementById("filter");
    var main_search = document.getElementById("search");
    var search_go = document.getElementById("search_go");

    main_size.oninput = function(){
        d3.selectAll(".circle").remove().exit()
        draw_main(this.value)
    }

    filter_main_select.oninput = function(){
        if (main_size.value > 100){
            main_size.value = 100;
        }
        d3.selectAll(".circle").remove().exit()
        draw_main(main_size.value)
    }

    reset_highlight.onclick = function(){
        reset_all();
        d3.selectAll(".arc").remove().exit();
        d3.selectAll(".game_details").html("");
    }

    search_go.onclick = function(){
        reset_main();
        for (let i=0; i<data.length; i++){
            if (data[i].Name.replace(/\s/g, '').replace(":","").replace("/","").replace(".","").search(main_search.value.replace(/\s/g, '').replace(":","").replace("/",""))!=-1){
                reset_all()
                draw_pit(data[i]);
                draw_secondary_bars(data[i].Genre)
                draw_secondary_bar_platform(data[i].Platform.split(" ")[0])
                d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
                d3.selectAll(".total").transition().duration(300).style("fill", "steelblue");
                d3.selectAll(".Name"+data[i].Name.replace(/\s/g, '').replace(":","").replace("/","").replace("&","").replace(".","")).raise();
                d3.selectAll(".Name"+data[i].Name.replace(/\s/g, '').replace(":","").replace("/","").replace("&","").replace(".","")).attr("stroke", "#00f9ff")
                d3.selectAll(".Name"+data[i].Name.replace(/\s/g, '').replace(":","").replace("/","").replace("&","").replace(".","")).style("stroke-width", 6)
                d3.selectAll(".Name"+data[i].Name.replace(/\s/g, '').replace(":","").replace("/","").replace("&","").replace(".","")).transition().duration(300).style("opacity",1)
                d3.selectAll(".totalYear"+data[i].Year).transition().duration(300).style("fill", "red");
                break;
            }
        }}


    
    // Primary view: Bubbles ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Color Schemes
    let colors = ["#ffed6f", "#80b1d3", "#ffffb3", "#8dd3c7", "#bc80bd", "#d9d9d9", "#fccde5", "#bebada", "#fb8072", "#fdb462", "#ccebc5", "#b3de69"];
    let genres = ['Sports', 'Platform', 'Racing', 'Role-Playing', 'Puzzle', 'Misc', 'Shooter', 'Simulation', 'Action', 'Fighting', 'Adventure', 'Strategy'];
           
    function color_genre(genre){
        for (let i=0; i<genres.length; i++){
            if (genres[i] == genre){
                return colors[i];
            }
        }
    }
    
    let x = 30
    let y = 820
    
    // Color Legend
    for (i=0; i<colors.length; i++){
        svg.append("rect")
            .attr("x",x)
            .attr("y",y)
            .attr("height", 30)
            .attr("width", 30)
            .style("fill", colors[i])
            .style("stroke", "black")

        svg.append("text")
            .attr("x",x+35)
            .attr("y",y+18)
            .text(genres[i].replace("Role-Playing", "RPG"))
            .style("fill", "black")
            .style("background-color", "black")

        x += 120;
    }
        

    var color_platform = d3.scaleOrdinal()
    .range([ "#000000", "#565656"])
    .domain([0, 1]);
    
    draw_main(1000);

    function draw_main(size){
        // Filter
        function filter_main(){
            let out = []
            if (filter_main_select.value == "None"){
                return data
            }
            for (let i=0; i<data.length; i++){
                if (data[i].Genre == filter_main_select.value){
                    out.push(data[i])
                }
            }
            return out
        }
        data_node = filter_main().slice(0,size);
        const x_center = 460;
        const y_center = 390;

        // Scales
        let scale_main_year = d3.scaleQuantize()
            .range([635, 630.4761904761904, 625.9523809523808, 621.4285714285713, 611.9047619047618, 602.3809523809523, 592.8571428571428, 583.3333333333333, 573.8095238095237, 564.2857142857142, 554.7619047619047, 545.2380952380952, 535.7142857142857, 526.1904761904761, 516.6666666666666, 507.1428571428571, 497.6190476190476, 488.0952380952381, 478.57142857142856, 469.04761904761904, 459.5238095238095, 450.0, 421.875, 393.75, 365.625, 337.5, 309.375, 281.25, 253.125, 225.0, 196.875, 168.75, 140.625, 112.5, 84.375, 56.25, 28.125, 0]
                )
            .domain([d3.min(data, (d) => d.Year), d3.max(data, (d) => d.Year)+1]);

        let scale_main_sales = d3.scaleLog()
            .range([5, 40])
            .domain([d3.min(data.slice(0,500), (d) => d.Global_Sales), d3.max(data, (d) => d.Global_Sales)+1]);

        let Axis_main = d3.axisLeft(scale_main_year);//.attr("transform","translate(150,0)");

        main_g.append('g')
            .attr('class', 'y-axis')
            .call(Axis_main
                .tickFormat(d3.format("")));
            
        main_g.append("text")
            .attr("transform","translate(-10, -10)")
            .text("Year")

        // Initialize the circle: all located at the center of the svg area
        var node = main_g.append("g")
        .selectAll("circle")
        .data(data_node)
        .enter()
        .append("circle")
            .attr("r", function(d){return scale_main_sales(d.Global_Sales)})
            .attr("cx", x_center)
            .attr("cy", function(d){return scale_main_year(d.Year)})
            .attr("class", function(d){return "circle Name"+d.Name.replace(/\s/g, '').replace(":","").replace("/","").replace("&","").replace(".","")+" Year"+d.Year+" Genre"+d.Genre+" Platform "+d.Platform.replace(",", " ").replace("3DS","TDS").replace("2600","A2600")+" Publisher"+d.Publisher.replace(/\s/g, '').replace(".","")+" Name"+d.Name.replace(/\s/g, '')})
            .style("fill", function(d){return color_genre(d.Genre)})
            .style("fill-opacity", 0.8)
            .attr("stroke", function(d){return color_platform(d.Multiplatform)})
            .style("stroke-width", 3)
            .on("mouseover", function(event, data_node){
                d3.select(this).raise();
                div.transition().duration(100).style("opacity", .9);
                div.html("Rank: "+data_node.Rank +"<br>"+ data_node.Name +"<br>"+ data_node.Year+"<br>"+data_node.Global_Sales+" million copies" ).style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, data_node){
                div.transition().duration(200).style("opacity", 0);
            })
            .on("click", function(event, data_node){
                reset_all();
                draw_secondary_bars(data_node.Genre)
                draw_secondary_bar_platform(data_node.Platform.split(" ")[0])
                d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
                d3.select(this).raise();
                d3.select(this).attr("stroke", "#00f9ff")
                d3.select(this).transition().duration(300).style("opacity",1)
                d3.select(this).style("stroke-width", 6)
                d3.selectAll('.Publisher'+data_node.Publisher.replace(/\s/g, '').replace(".","")).transition().duration(100).style("opacity",1);
                d3.selectAll('.totalYear'+data_node.Year).transition().duration(100).style("fill", "red");
                d3.selectAll(".arc").remove().exit();
                draw_pit(data_node);
            });

        // Features of the forces applied to the nodes:
        var simulation = d3.forceSimulation()
            .force("x", d3.forceX().strength(0.1).x( x_center))
            .force("y", d3.forceY().strength(0.5).y( function(d){return scale_main_year(d.Year)} ))
            .force("collide", d3.forceCollide().strength(1).radius(function(d){return (scale_main_sales(d.Global_Sales)+2) }).iterations(1)) 

        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(data_node)
            .on("tick", function(d){
                node
                .attr("cx", function(d){return d.x; })
                .attr("cy", function(d){ return d.y; })
            });
    }

    // Secondary view 1: Bar chart: total sales by year ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let data_total = [];
    for(var i=1980; i<2017; i++){
        data_total.push({'year': i, 'sales': 0});
    }

    for(i=0; i<data.length; i++){
        for(var j=0; j<data_total.length; j++){
            if (data_total[j]['year'] == data[i]['Year']){
                data_total[j]['sales'] += data[j]["Global_Sales"]
            }
        }
    }

    let xScale_total = d3.scaleBand()
        .range([0, 450])
        .domain(data_total.map(function(d) {return d.year;}));
    let yScale_total = d3.scaleLinear()
        .range([200, 0])
        .domain([0, d3.max(data_total, (d) => d.sales)]);

    let xAxis_total = d3.axisBottom(xScale_total);
    let yAxis_total = d3.axisLeft(yScale_total);

    sec_g_1.append("text")             
    .attr("transform", "translate(40,-5)")
    .style("text-anchor", "left")
    .text("Industry-Wide Significant Game Sales (million copies)");

    sec_g_1.append('g')
        .attr("transform", "translate(0,200)")
        .attr('class', 'x-axis')
        .call(xAxis_total)
        .selectAll('text')
            .attr("transform", "translate(-10,5)rotate(-60)")
            .style("text-anchor", "end");
    sec_g_1.append('g')
        .attr('class', 'y-axis')
        .call(yAxis_total);

    sec_g_1.selectAll('.bar_tot')
        .data(data_total)
        .enter()
        .append('rect')
        .attr('class', 'bar_tot')
        .attr('x', d=> xScale_total(d.year))
        .attr('y', d=> yScale_total(d.sales))
        .attr("class", function(d){return "total totalYear"+d.year})
        .attr('width', xScale_total.bandwidth())
        .attr('height', d => {return 200 - yScale_total(d.sales);})
        .attr('fill', 'steelblue')
        .attr('stroke', 'black')
        .attr('stroke-width', '2')
        .on("mouseover", function(event, data_total){
            div_total.transition().duration(100).style("opacity", .9);
            div_total.html("Year: "+data_total.year+"<br>"+(data_total.sales-data_total.sales%1)+"m").style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, data_total){
            div_total.transition().duration(200).style("opacity", 0);
        })
        .on("click", function(event, data_total){
            reset_all();
            d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
            d3.select(this).raise();
            d3.select(this).attr("stroke", "#00f9ff")
            d3.select(this).style("stroke-width", 3)
            d3.select(this).transition().duration(300).style("fill", "red");
            d3.selectAll(".Year"+data_total.year).transition().duration(300).style("opacity", "1");
        })
    // Secondary View 2: Bar Charts: genre/ platform sales by year /////////////////////////////////////////////////////////////////////////////////////////
    draw_secondary_bars("Action")
    function draw_secondary_bars(genre){
        var button_sec_2 = d3.select("body")
            .append("button")
            .text("Highlight Genre")
            .attr("class", "genre_but")
            .attr("value", "highlight_genre")
            .style("position", "absolute")
            .style("left", "1330px").style("top","280px");

        button_sec_2.on("click", function(){
            d3.selectAll('.circle').transition().duration(300).style("opacity", 1)
            d3.selectAll(".circle").style("fill", function(d){return color_genre(d.Genre)});
            reset_secs();
            d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
            d3.selectAll(".Genre"+genre).transition().duration(300).style("opacity", 1);
        })

        d3.selectAll(".genre").remove().exit()
        let data_sec1 = [];
        for(var i=1980; i<2017; i++){
            data_sec1.push({'year': i, 'sales': 0});
        }

        for(i=0; i<data.length; i++){
            for(var j=0; j<data_sec1.length; j++){
                if (data_sec1[j]['year'] == data[i]['Year'] && data[i]['Genre'] == genre){
                    data_sec1[j]['sales'] += data[j]["Global_Sales"]
                }
            }
        }

        let xScale_total = d3.scaleBand()
            .range([0, 450])
            .domain(data_sec1.map(function(d) {return d.year;}));
        let yScale_total = d3.scaleLinear()
            .range([100, 0])
            .domain([0, d3.max(data_total, (d) => d.sales/2)]);

        let xAxis_total = d3.axisBottom(xScale_total);
        let yAxis_total = d3.axisLeft(yScale_total);

        sec_g_2.append("text")             
        .attr("transform", "translate(40,-5)")
        .style("text-anchor", "left")
        .attr("class", "genre text")
        .text("Genre-Specific Sales - "+genre);

        sec_g_2.append('g')
            .attr("transform", "translate(0,100)")
            .attr('class', 'x-axis')
            .call(xAxis_total)
            .selectAll('text')
                .attr("transform", "translate(-10,5)rotate(-60)")
                .style("text-anchor", "end");
        sec_g_2.append('g')
            .attr('class', 'y-axis')
            .call(yAxis_total
                .ticks(5));
        sec_g_2.selectAll('.bar_gen')
            .data(data_sec1)
            .enter()
            .append('rect')
            .attr('class', 'bar_tot')
            .attr('x', d=> xScale_total(d.year))
            .attr('y', d=> yScale_total(d.sales))
            .attr("class", function(d){return "genre totalYear"+d.year})
            .attr('width', xScale_total.bandwidth())
            .attr('height', d => {return 100 - yScale_total(d.sales);})
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .on("mouseover", function(event, data_total){
                div_total.transition().duration(100).style("opacity", .9);
                div_total.html("Year: "+data_total.year+"<br>"+(data_total.sales-data_total.sales%1)+"m").style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, data_total){
                div_total.transition().duration(200).style("opacity", 0);
            })
            .on("click", function(event, data_total){
                reset_all();
                d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
                d3.selectAll(".totalYear"+data_total.year).transition().duration(300).style("fill", "red");
                d3.select(this).raise();
                d3.select(this).attr("stroke", "#00f9ff")
                d3.select(this).style("stroke-width", 3)
                d3.select(this).transition().duration(300).style("fill", "red");
                d3.selectAll(".Year"+data_total.year+".Genre"+genre).transition().duration(300).style("opacity", 1);
            })
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        draw_secondary_bar_platform("PS3")
        function draw_secondary_bar_platform(platform){
            d3.selectAll(".platform").remove().exit()
            let data_sec2 = [];
        for(var i=1980; i<2017; i++){
            data_sec2.push({'year': i, 'sales': 0});
        }

        var button_sec_2_2 = d3.select("body")
            .append("button")
            .text("Highlight Platform")
            .attr("value", "highlight_platform")
            .style("position", "absolute")
            .style("left", "1330px").style("top","430px");

        button_sec_2_2.on("click", function(){
            d3.selectAll('.circle').transition().duration(300).style("opacity", 1)
            d3.selectAll(".circle").style("fill", function(d){return color_genre(d.Genre)});
            reset_secs();
            d3.selectAll(".circle").transition().duration(300).style("opacity",0.15)
            d3.selectAll("."+platform.replace("3DS","TDS").replace("2600","A2600")).transition().duration(300).style("opacity", 1);
        })

        for(i=0; i<data.length; i++){
            for(var j=0; j<data_sec2.length; j++){
                if (data_sec2[j]['year'] == data[i]['Year'] && data[i]['Platform'].search(platform) != -1){
                    data_sec2[j]['sales'] += data[j]["Global_Sales"]
                }
            }
        }

        let xScale_total = d3.scaleBand()
            .range([0, 450])
            .domain(data_sec2.map(function(d) {return d.year;}));
        let yScale_total = d3.scaleLinear()
            .range([100, 0])
            .domain([0, d3.max(data_total, (d) => d.sales/2)]);

        let xAxis_total = d3.axisBottom(xScale_total);
        let yAxis_total = d3.axisLeft(yScale_total);

        let sec_g_2_2 = sec_g_2.append("g")
                .attr("transform", "translate(0,150)")
                
        sec_g_2_2.append("text")             
        .attr("transform", "translate(40,-5)")
        .style("text-anchor", "left")
        .attr("class", "genre text")
        .text("Platform-Specific Sales - "+platform);

        sec_g_2_2.append('g')
            .attr("transform", "translate(0,100)")
            .attr('class', 'x-axis')
            .call(xAxis_total)
            .selectAll('text')
                .attr("transform", "translate(-10,5)rotate(-60)")
                .style("text-anchor", "end");
        sec_g_2_2.append('g')
            .attr('class', 'y-axis')
            .call(yAxis_total
                .ticks(5));
        sec_g_2_2.selectAll('.bar_gen')
            .data(data_sec2)
            .enter()
            .append('rect')
            .attr('class', 'bar_tot')
            .attr('x', d=> xScale_total(d.year))
            .attr('y', d=> yScale_total(d.sales))
            .attr("class", function(d){return "genre totalYear"+d.year})
            .attr('width', xScale_total.bandwidth())
            .attr('height', d => {return 100 - yScale_total(d.sales);})
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .on("mouseover", function(event, data_total){
                div_total.transition().duration(100).style("opacity", .9);
                div_total.html("Year: "+data_total.year+"<br>"+(data_total.sales-data_total.sales%1)+"m").style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, data_total){
                div_total.transition().duration(200).style("opacity", 0);
            })
            .on("click", function(event, data_total){
                reset_all();
                d3.selectAll(".circle").transition().duration(300).style("opacity",0.15);
                d3.selectAll(".totalYear"+data_total.year).transition().duration(300).style("fill", "red");
                d3.select(this).raise();
                d3.select(this).attr("stroke", "#00f9ff")
                d3.select(this).style("stroke-width", 3)
                d3.select(this).transition().duration(300).style("fill", "red");
                d3.selectAll(".Year"+data_total.year+"."+platform.replace("3DS","TDS").replace("2600","A2600")).transition().duration(300).style("opacity", 1);
            })
        }

    // Secondary View 3: Pie Chart: tegional sales breakdown for the selected game ///////////////////////////////////////////////////////////////////////////////////
    // Color
    var color_pie = d3.scaleOrdinal()
        .range(["#00d8ff", "#2700ff", "#ff378c", "#8d8e8e"])

    sec_g_3.append("text")             
        .attr("transform", "translate(40,15)")
        .style("text-anchor", "left")
        .text("Game Details / Sales Breakdown");
    
    draw_pit(data_node[1])
    function draw_pit(pie_in){
        d3.selectAll(".arc").remove().exit();

        var pie_center = sec_g_3.append("g")
                .attr("transform", "translate(300,125)")

        let pie_data = [pie_in.NA_Sales, pie_in.EU_Sales, pie_in.JP_Sales, pie_in.Other_Sales]

        let pie = d3.pie()
        
        let arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(100)

        let arcs = pie_center.selectAll("arc")
                    .data(pie(pie_data))
                    .enter()
                    .append("g")
                    .attr("class", "arc")

        arcs.append("path")
            .attr("fill", function(d, i) {
                return color_pie(i);
            })
            .attr("d", arc)
            .on("mouseover", function(event, d){
                div_pie.transition().duration(100).style("opacity", .9);
                div_pie.html(pie_data[d.index]+"m<br> copies").style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d){
                div_pie.transition().duration(200).style("opacity", 0);
            })
        
        pie_center.selectAll('p')
            .data(pie(pie_data))
            .enter()
            .append('text')
            .attr('class','arc')
            .text(function(d,i){ return ["NA","EU","JP","Other"][i]})
            .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";  })
            .style("text-anchor", "middle")
            .style("font-size", 17)
            .style("fill", function(d,i){ return ["black","white","white","white"][i]})
    
        // Game Details
        div_pie_detail.html("Title:"+pie_in.Name+"<br>"+pie_in.Year+"<br>Rank: "+pie_in.Rank+"<br>Platform: "+pie_in.Platform+"<br>Publisher: "+pie_in.Publisher+"<br>Genre: "+pie_in.Genre+"<br>Global Sales: "+pie_in.Global_Sales+"<br>(million copies)")
    }

// Helper Functinons /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function reset_main(){
        d3.selectAll('.circle').attr("stroke", function(d){return color_platform(d.Multiplatform)})
        d3.selectAll('.circle').transition().duration(300).style("opacity", 1)
        d3.selectAll('.circle').style("stroke-width", 3)
        d3.selectAll(".circle").style("fill", function(d){return color_genre(d.Genre)});
    }

    function reset_secs(){
        d3.selectAll('.total').attr("stroke", "black")
        d3.selectAll('.total').style("stroke-width", 2)
        d3.selectAll(".total").transition().duration(300).style("fill", "steelblue");
        d3.selectAll('.genre').attr("stroke", "black")
        d3.selectAll('.genre').style("stroke-width", 2)
        d3.selectAll(".genre").transition().duration(300).style("fill", "steelblue");
        d3.selectAll(".text").transition().duration(300).style("fill", "black");
        d3.selectAll('.text').style("stroke-width", 0)
    }

    function reset_all(){
        reset_main();
        reset_secs();
    }
    })

