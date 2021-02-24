$(function() {
    var maxDistance = 3;

    var style = [
        // Nodes
        {
            selector: 'node',
            style: {
                'label': 'data(id)',
                'background-color': '#bbbbbb',
                'width': '20px',
                'height': '20px',
                'border-width' : '1px',
                'border-style' : 'solid',
                'border-color' : '#555555'
            }
        },
        {
            selector: '.dark',
            style: {
                'background-color': '#ff9900'
            }
        },
        {
            selector: '.kinase',
            style: {
                'shape' : 'round-rectangle'
            }
        },
        {
            selector: '.bait',
            style: {
                'width' : '50px'
            }
        },

        // Edges
        {
            selector: 'edge',
            style: {
                'width': '2px'
            }
        },
        {
            selector: '.V5',
            style: {
                'line-color': '#cbd5e8'
            }
        },
        {
            selector: '.miniTurbo',
            style: {
                'line-color': '#f1e2cc'
            }
        },
        {
            selector: '.db',
            style: {
                'line-color': '#dddddd'
            }
        },

        // Selected
        {
            selector: ':selected',
            style:{
                'background-color' : 'red'
            }
        },
        // Active
        /*{
            selector: ':active',
            style:{
                'background-color' : 'red'
            }
        }*/
        // Hover
        {
            selector: 'node.hoverNode',
            css: {
                //'font-weight':'bold'
                //'background-color': "#f4cae4",
            }
        },
        {
            selector: 'node.hoverNotNode',
            css: {
                'text-opacity': 0.2,
                'opacity': 0.2
            }
        },
        {
            selector: 'edge.hoverNotNode',
            css: {
                'opacity': 0.2
            }
        },
        {
            selector: 'edge.hoverEdge',
            css: {
                'width': '6px'
            }
        },
        {
            selector: 'node.pathToBait',
            css: {
                //'font-weight':'bold'
                //'background-color': "#f4cae4",
            }
        },
        {
            selector: 'edge.pathToBait',
            css: {
                'line-style': 'dashed'
            }
        },
    ]

    var cy;
    var removedNodes = new Set();
    var removedEdges = new Set();
    var bait;
    var numBait;
    var layout;

    var createGUI = function(baitName, numBaits){

        // Create UI
        var $ = document.querySelector.bind(document);

        var h = function(tag, attrs, children){
            var el = document.createElement(tag);

            Object.keys(attrs).forEach(function(key){
                var val = attrs[key];

                el.setAttribute(key, val);
            });

            children.forEach(function(child){
                el.appendChild(child);
            });

            return el;
        };

        var t = function(text){
            var el = document.createTextNode(text);

            return el;
        };

        var $control = $('#cy-control');

        // Export, Reset, Redraw row
        var $controlRow1 = h('div', {'class': 'cy-param'}, []);

        // Export button
        var $exportButton = h('button', { 'class': 'cy-button' }, [ t("Export PNG") ]);
        $exportButton.addEventListener('click', function(){
            var b64key = 'base64,';
            var pngData = cy.png({full:true, scale:cy.zoom()});
            var b64 = pngData.substring( pngData.indexOf(b64key) + b64key.length );
            var imgBlob = b64toBlob( b64, 'image/png' );

            saveAs( imgBlob, 'DKK_PPI.png' );
        });
        // Reset View button
        var $resetButton = h('button', { 'class': 'cy-button' }, [ t("Center View") ]);
        $resetButton.addEventListener('click', function(){
            cy.fit();
        });
        // Redraw button
        var $redrawButton = h('button', { 'class': 'cy-button' }, [ t("Perform Layout") ]);
        $redrawButton.addEventListener('click', function(){
            cy.stop();
            cy.layout({ name: 'cola',
                nodeSpacing: 5,
                edgeLengthVal: 45,
                animate: true,
                randomize: false,
                maxSimulationTime: 5000}
            ).run();
        });

        $controlRow1.appendChild( $exportButton );
        $controlRow1.appendChild( $resetButton );
        $controlRow1.appendChild( $redrawButton );

        // Uniqueness and Distance row
        var $controlRow2 = h('div', {'class': 'cy-param'}, []);
        // Unique filter

        var $uniquenessInput = h('input', {'class': 'cy-param-input cy-param-slider', 'type':'range', "min":"1", "max":numBaits, "step":"1", "value":numBaits}, []);
        var $uniqueValue = t($uniquenessInput.value);
        $uniquenessInput.addEventListener('input', function(){
            $uniqueValue.nodeValue = $uniquenessInput.value;
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });


        $controlRow2.appendChild(h('span', {'class':'cy-param-header'}, [t("Filter common interactors (per APMS method):")]));
        var $uniqueRow = h('div', {}, []);
        $controlRow2.appendChild($uniqueRow);
        $uniqueRow.appendChild($uniquenessInput);
        $uniqueRow.appendChild($uniqueValue);
        $uniqueRow.appendChild(t("/" + numBaits + " baits"));


        // Distance filter

        var $distanceInput = h('input', {'class': 'cy-param-input cy-param-slider', 'type':'range', "min":"1", "max":maxDistance, "step":"1", "value":"1"}, []);
        var $distanceValue = t($distanceInput.value);
        $distanceInput.addEventListener('input', function(){
            $distanceValue.nodeValue = $distanceInput.value;
            if ($distanceInput.value == 1){
                $edgeLabel.nodeValue = " edge"
            } else {
                $edgeLabel.nodeValue = " edges"
            }
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });


        var $controlRow3 = h('div', {'class': 'cy-param'}, []);
        $controlRow3.appendChild(h('span', {'class':'cy-param-header'}, [t("Interaction distance from " + baitName + ":")]));
        var $distanceRow = h('div', {}, []);
        $controlRow3.appendChild($distanceRow);
        $distanceRow.appendChild($distanceInput);
        $distanceRow.appendChild($distanceValue);
        var $edgeLabel = t(" edge");
        $distanceRow.appendChild($edgeLabel);



        // Proximity, APMS, DB row
        var $controlRow4= h('div', {'class': 'cy-param'}, []);

        var $apmsInput = h('input', {'class': 'cy-param-input', 'type':'checkbox', "name":"APMS", "checked":"1"}, []);
        $apmsInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $apmsLabel = t("Co-complexed proteins (V5)");
        var $apmsRow= h('div', {}, []);
        $apmsRow.appendChild($apmsInput);
        $apmsRow.appendChild($apmsLabel);

        var $proxInput = h('input', {'class': 'cy-param-input', 'type':'checkbox', "name":"Proximity", "checked":"1"}, []);
        $proxInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $proxLabel = t("Proximal proteins (miniTurbo)");
        var $proxRow= h('div', {}, []);
        $proxRow.appendChild($proxInput);
        $proxRow.appendChild($proxLabel);

        var $dbInput = h('input', {'class': 'cy-param-input', 'type':'checkbox', "name":"DB"}, []);
        $dbInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $dbLabel = t("Database interactions");
        var $dbRow= h('div', {'class':'hidden'}, []);
        $dbRow.appendChild($dbInput);
        $dbRow.appendChild($dbLabel);

        $controlRow4.appendChild(h('span', {'class':'cy-param-header'}, [t("Interactions to display:")]));
        $controlRow4.appendChild($apmsRow);
        $controlRow4.appendChild($proxRow);
        $controlRow4.appendChild($dbRow);

        // GO Annotations
        var $controlRow5= h('div', {'class': 'cy-param hidden'}, []);
        var $NOInput = h('input', {'class': 'cy-param-input', 'type':'radio', "id":"NO", "name":"GO", "checked":"1"}, []);
        $NOInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $NOLabel= t("None");
        var $NORow= h('div', {}, []);
        $NORow.appendChild($NOInput);
        $NORow.appendChild($NOLabel);

        var $BPInput = h('input', {'class': 'cy-param-input', 'type':'radio', "id":"BP", "name":"GO"}, []);
        $BPInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $BPLabel= t("Biological Process");
        var $BPRow= h('div', {}, []);
        $BPRow.appendChild($BPInput);
        $BPRow.appendChild($BPLabel);

        var $CCInput = h('input', {'class': 'cy-param-input', 'type':'radio', "id":"CC", "name":"GO"}, []);
        $CCInput.addEventListener('change', function(){
            //updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
            cy.stop();
            cy.layout({ name: 'cerebral-ext',
                        layers: {1:["extracellular region"],
                            2:["cell surface"],
                            3:["plasma membrane"],
                            4:["mitochondrion", "cytoskeleton", "endoplasmic reticulum", "Golgi apparatus", "cytoplasm"],
                            5:["nucleus"],
                            6:["unknown / other"] },
                        num_vertical_layers: 6,
                        layer_attribute_name: "cc"}
            ).run();

        });
        var $CCLabel= t("Cellular Component");
        var $CCRow= h('div', {}, []);
        $CCRow.appendChild($CCInput);
        $CCRow.appendChild($CCLabel);

        var $MFInput = h('input', {'class': 'cy-param-input', 'type':'radio', "id":"MF", "name":"GO"}, []);
        $MFInput.addEventListener('change', function(){
            updateNetworkFromQuery(bait, $uniqueValue.nodeValue , $distanceInput.value , $apmsInput.checked, $proxInput.checked, $dbInput.checked, $('input[name="GO"]:checked').id)
        });
        var $MFLabel= t("Molecular Function");
        var $MFRow= h('div', {}, []);
        $MFRow.appendChild($MFInput);
        $MFRow.appendChild($MFLabel);

        $controlRow5.appendChild(h('span', {'class':'cy-param-header'}, [t("Gene Ontology Annotations:")]));
        $controlRow5.appendChild($NORow);
        $controlRow5.appendChild($BPRow);
        $controlRow5.appendChild($CCRow);
        $controlRow5.appendChild($MFRow);

        var $legendRow= h('div', {'class': 'cy-param'}, []);
        $legendRow.appendChild(h('span', {'class':'cy-param-header'}, [t("Legend:")]))
        var $legendRow1= h('div', {}, []);
        var $legendRow2= h('div', {}, []);
        var $legendRow3= h('div', {}, []);

        $legendRow1.appendChild(h('img', {'class':'cy-legend-img', 'src': '../images/PPI/apms-icon.png'}, []));
        $legendRow1.appendChild(h('span', {'class':'cy-legend-col2'}, [t("Co-complexed")]));

        $legendRow1.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/Bait-icon.png'}, []));
        $legendRow1.appendChild(h('span', {'class':'cy-legend-col4'}, [t("Bait")]));

        $legendRow1.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/kinase-icon.png'}, []));
        $legendRow1.appendChild(t("Kinase"));

        $legendRow2.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/prox-icon.png'}, []));
        $legendRow2.appendChild(h('span', {'class':'cy-legend-col2'}, [t("Proximal")]));

        $legendRow2.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/prey-icon.png'}, []));
        $legendRow2.appendChild(h('span', {'class':'cy-legend-col4'}, [t("Non-kinase")]));

        $legendRow2.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/dark-icon.png'}, []));
        $legendRow2.appendChild(t("Dark"));



        $legendRow3.appendChild(h('img', {'class':'cy-legend-img','src': '../images/PPI/db-icon.png'}, []));
        $legendRow3.appendChild(t("Database interaction"));

        $legendRow.appendChild($legendRow1);
        $legendRow.appendChild($legendRow2);
        $legendRow.appendChild($legendRow3);



        // Description
        $control.appendChild(h('span', {'class':'cy-blurb-header'}, [t("Data Description: ")]));
        $control.appendChild(h('span', {'class':'cy-blurb'}, [t("APMS data " +
            "were analyzed using SAINT to remove proteins observed in control experiments. " +
            "Candidate interactions were filtered for a \u22641% interaction false discovery rate (FDR) and " +
            "each having \u226590% interaction probability.")]));
        $control.appendChild( $controlRow2 );
        $control.appendChild( $controlRow3 );
        $control.appendChild( $controlRow4 );
        $control.appendChild( $controlRow5 );
        $control.appendChild( $controlRow1 );

        $control.appendChild($legendRow);
    }

    var updateNetworkFromQuery = function(bait, uniqueness, max_depth, show_apms, show_prox, show_db, GO)
    {
        cy.startBatch();

        //cy.elements().removeClass(['pathToBait', 'hoverNotNode', 'hoverEdge']);

        removedNodes.forEach(function( n ){ n.restore(); });
        removedEdges.forEach(function( e ){ e.restore(); });

        removedNodes.clear();
        removedEdges.clear();

        cy.elements("edge[numBaits > " + uniqueness + "]").forEach(function( e ){
            removedEdges.add(e);
        });

        if (!show_apms) {
            cy.edges(".V5").forEach(function( e ){ removedEdges.add(e); });
        }

        if (!show_prox) {
            cy.edges(".prox").forEach(function( e ){ removedEdges.add(e); });
        }

        if (!show_db) {
            cy.edges(".db").forEach(function( e ){ removedEdges.add(e); });
        }

        removedNodes.forEach(function( n ){
            n.connectedEdges().forEach(function( e ){ removedEdges.add(e); });
            n.remove();
        });

        removedEdges.forEach(function( e ){ e.remove(); });

        var bfs = cy.elements().bfs({
            roots: bait,
            visit: function(v, e, u, i, depth){
                if (depth > max_depth)
                {
                    removedNodes.add(v);
                }
            },
            directed: false
        });

        removedNodes.forEach(function( n ){
            n.connectedEdges().forEach(function( e ){ removedEdges.add(e); });
            n.remove();
        });

        removedEdges.forEach(function( e ){ e.remove(); });

        var unconnectedComponents = cy.nodes().diff(cy.elements().componentsOf(bait)[0]).left;
        for(var i = 0; i < unconnectedComponents.length; i++)
        {
            removedNodes.add(unconnectedComponents[i]);
            unconnectedComponents[i].connectedEdges().forEach(function( e ){ removedEdges.add(e);; });
            unconnectedComponents[i].remove();
        }

        cy.endBatch();

    }

    var $isFirstShow = true;

    $("#NetworkCollapse").on('shown.bs.collapse', function (e) {
        if (!$isFirstShow) return;
        $isFirstShow = false;

        Promise.all([
            fetch('/javascripts/PPI/ppi.json')
                .then(res => res.json())
        ])
            .then(function (dataArray) {
                cy = window.cy = cytoscape({
                    container: document.getElementById('cy'),
                    elements: dataArray[0],
                    style: style
                });

                cy.on('mouseover', 'node', function(e) {
                    var node = e.target;
                    var neighborhood = node.closedNeighborhood();
                    neighborhood.toggleClass('hoverEdge');

                    var notNeighborhood = cy.elements().diff(neighborhood).left;
                    notNeighborhood.toggleClass('hoverNotNode');

                    var minDist = cy.elements().aStar({root: node, goal: bait}).path.edges().length;

                    if (node != bait) {
                        var elementsToBait = allShortestPaths({source:node, target:bait, minDist:minDist, cy:cy}).path;

                        elementsToBait.forEach(function (p) {
                            if (notNeighborhood.contains(p))
                            {
                                p.toggleClass('pathToBait');
                                p.toggleClass('hoverNotNode');
                            }
                        });
                    }
                });

                cy.on('mouseover', 'edge', function(e) {
                    var edge = e.target;
                    var neighborhood = edge.connectedNodes().add(edge);
                    edge.toggleClass('hoverEdge');
                    cy.elements().diff(neighborhood).left.toggleClass('hoverNotNode');
                });

                cy.on('mouseout', 'node', function(e) {
                    var node = e.target;
                    var neighborhood = node.closedNeighborhood();
                    neighborhood.toggleClass('hoverEdge');

                    var notNeighborhood = cy.elements().diff(neighborhood).left;
                    notNeighborhood.toggleClass('hoverNotNode');

                    var minDist = cy.elements().aStar({root: node, goal: bait}).path.edges().length;

                    if (node != bait) {
                        var elementsToBait = allShortestPaths({source:node, target:bait, minDist:minDist, cy:cy}).path;

                        elementsToBait.forEach(function (p) {
                            if (notNeighborhood.contains(p))
                            {
                                p.toggleClass('pathToBait');
                                p.toggleClass('hoverNotNode');
                            }
                        });
                    }
                });

                cy.on('mouseout', 'edge', function(e) {
                    var edge = e.target;
                    var neighborhood = edge.connectedNodes().add(edge);
                    edge.toggleClass('hoverEdge');
                    cy.elements().diff(neighborhood).left.toggleClass('hoverNotNode');
                });

                numBait = 0;

                for (var i = 0, numEle = dataArray[0].length; i < numEle; i++)
                {
                    if (dataArray[0][i].classes.includes("bait"))
                    {
                        numBait += 1;
                    }
                }

                var baitName = window.location.href.split("/").slice(-1)[0]
                createGUI(baitName, numBait);

                bait = cy.getElementById(baitName);

                cy.startBatch();
                // bait not present
                if(!bait.id())
                {
                    cy.remove(cy.elements());
                    return;
                }

                var toCompletelyRemove = [];
                cy.elements().bfs({
                    roots: bait,
                    visit: function(v, e, u, i, depth)
                    {
                        if (depth > maxDistance) toCompletelyRemove.push(v);
                    },
                    directed: false
                });

                for(var i = 0; i < toCompletelyRemove.length; i++) {
                    toCompletelyRemove[i].remove();
                }

                delete toCompletelyRemove;

                cy.endBatch();

                layout = cy.layout({ name: 'cola',
                    nodeSpacing: 5,
                    edgeLengthVal: 45,
                    animate: true,
                    randomize: true,
                    maxSimulationTime: 5000}
                );

                updateNetworkFromQuery(bait, numBait, 1, true, true, false, "None");

                layout.run();

            });

    });
});


