
(function($$) {

    var defaults = {
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding used on fit
        layers: {1:["layer 1"], 2:["layer 2", "layer 3"], 3:["layer 4"]},
        num_vertical_layers: 3,
        layer_attribute_name: "layer", //name of the attribute that contains the information of the node layer
        background: "#FFFFFF", //background color
        lineWidth: 0.2, // width of the line between layers
        strokeStyle: '#323232', // color of the line between layers
        font: "12pt Arial", // font of the labels of each layer
    };

    function CerebralLayout(options) {
        this.options = Object.assign(defaults, options);
    }

    CerebralLayout.prototype.run = function() {
        var options = this.options;
        var cy = options.cy;
        var totalNodes = cy.elements().length;
        var container = cy.container();
        var totalWidth = container.clientWidth - 180;

        //grid
        var objCanvas = document.createElement('canvas');
        objCanvas.style.position = "absolute";
        objCanvas.style.zIndex = "-4";
        objCanvas.setAttribute("data-id", "grid");
        objCanvas.setAttribute("width", container.clientWidth);
        objCanvas.setAttribute("height", container.clientHeight);
        var aux = [];
        for (i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].innerHTML && container.childNodes[i].innerHTML.startsWith("<canvas")) {
                container.childNodes[i].appendChild(objCanvas);
            } else {
                aux.push(container.childNodes[i]);
            }
        }
        for (i = 0; i < aux.length; i++) {
            container.removeChild(aux[i]);
        }
        var objContext = objCanvas.getContext("2d");
        objContext.globalCompositeOperation = 'source-over';

        objContext.fillStyle = options.background;
        objContext.fillRect(0, 0, container.clientWidth, container.clientHeight);

        objContext.textAlign = "end";

        var nodes = {};

        var height = 0;
        var heightAcum = 0;
        var width = 0;
        var widthAcum = 0;

        var pseudocount = totalNodes * 0.5;
        var pseudoVerticalTotal = totalNodes + (options.num_vertical_layers * pseudocount);

        var room = 20;

        for (i = 1; i <= Object.keys(options.layers).length; i++) {
            var key = i.toString();
            var numHorizontalNodes = pseudocount;

            for (j = 0; j < options.layers[key].length; j++) {
                var nodesAux = cy.elements("node[" + options.layer_attribute_name + " = '" + options.layers[key][j] + "']");
                nodes[options.layers[key][j]] = nodesAux;
                numHorizontalNodes += nodesAux.length;
            }

            height = Math.ceil((container.clientHeight - 10 - (options.num_vertical_layers * room)) / (pseudoVerticalTotal / numHorizontalNodes));

            if (i < Object.keys(options.layers).length) {
                var line = heightAcum + height + (room / 2);

                objContext.moveTo(0, line);
                objContext.lineTo(objCanvas.width, line);
                objContext.lineWidth = options.lineWidth;
                objContext.strokeStyle = options.strokeStyle;
                objContext.stroke();
            }

            var y = heightAcum + Math.ceil((height) / 2);
            if (heightAcum == 0) {
                y = line / 2;
            }

            widthAcum = 0;
            width = 0;
            var hPsuedocount = numHorizontalNodes*0.4;
            var totalHorizontalPseudo = numHorizontalNodes-pseudocount + (hPsuedocount * (options.layers[key].length));

            for (j = 0; j < options.layers[key].length; j++) {

                var nodesAux = cy.elements("node[" + options.layer_attribute_name + " = '" + options.layers[key][j] + "']");

                width = Math.ceil(container.clientWidth *
                    (nodesAux.length + hPsuedocount) / totalHorizontalPseudo);

                if (j < options.layers[key].length -1 ) {
                    objContext.moveTo(width + widthAcum, heightAcum);
                    objContext.lineTo(width + widthAcum, height + heightAcum);
                    objContext.lineWidth = options.lineWidth;
                    objContext.strokeStyle = options.strokeStyle;
                    objContext.stroke();
                }

                objContext.textBaseline = "middle";
                objContext.font = options.font;
                objContext.fillStyle = "#777777";
                objContext.fillText(options.layers[key][j], widthAcum + width - 5, heightAcum+10);

                nodesAux.positions(function(element, k) {
                    if (element.locked()) {
                        return false;
                    }

                    return {
                        x: Math.round((Math.random() * width-10) + 5 + widthAcum),
                        y: Math.round((Math.random() * height-20) + 15 + heightAcum)
                    };
                });

                widthAcum += width;
            }

            heightAcum += height + room;
        }

        cy.one("layoutready", options.ready);
        cy.trigger("layoutready");

        cy.one("layoutstop", options.stop);
        cy.trigger("layoutstop");
    };



    // called on continuous layouts to stop them before they finish
    CerebralLayout.prototype.stop = function() {
        var options = this.options;
        var cy = options.cy;

        cy.one('layoutstop', options.stop);
        cy.trigger('layoutstop');
    };


    $$("layout", "cerebral-ext", CerebralLayout);

})(cytoscape);