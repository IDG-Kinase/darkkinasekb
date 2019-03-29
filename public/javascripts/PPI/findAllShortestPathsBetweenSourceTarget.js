var allShortestPaths = function(options) {

    var root = options.source;
    var goal = options.target;
    var minDist = options.minDist;

    let cy = options.cy;
    let v = root;
    let connectedNodes = new Set();
    let currentPath = [];
    let connectedBy = {};
    let id2depth = {};
    let nodes = cy.nodes();

    //window.alert(minDist);

    var dfs = function(v, prevNode, depth) {
        // check if we should break (too far)
        if (depth > minDist || (depth == minDist && v != goal)) { return; }

        currentPath.push( v );

        // check if we reached our goal at the correct depth
        if (depth == minDist && v == goal) {
            currentPath.forEach(function (n) {
                connectedNodes.add(n);
                //window.alert(n.id());
            });
            return;
        }


        //printSet(connectedNodes);

        let vwEdges = v.connectedEdges();
        for( let i = 0; i < vwEdges.length; i++ ){
            let e = vwEdges[ i ];
            let w = e.connectedNodes().filter(n => !n.same(v) && nodes.has(n) && !n.same(prevNode));


            let wId = w.id();


            if (w.length !== 0) {
                w = w[0];
                // check if we're looking at an already accepted node at the same distance
                if (connectedNodes.has(w) && id2depth[wId] == depth + 1) {
                    currentPath.forEach(function (n) {
                        connectedNodes.add(n);
                        connectedBy[ wId ].add(e);
                        //window.alert(n.id());
                        });
                } else if (!connectedNodes.has(w) && wId in id2depth && id2depth[wId] <= depth + 1) {
                    continue;
                } else {
                    if (!connectedBy[ wId ]) {
                        connectedBy[ wId ] = new Set();
                    }
                    connectedBy[ wId ].add(e);
                    //printEdge(e)
                    id2depth[ wId ] = depth + 1;
                    dfs(w, v, depth + 1);
                }
            }
        }
        currentPath.pop();

    }

    id2depth[ v.id() ] = 0;
    dfs(v, null, 0);

    let connectedEles = cy.collection();

    //window.alert(["connected nodes: ", connectedNodes.size]);
    connectedNodes.forEach(function( node ){
        //window.alert(node.id());
        let edges =  connectedBy[ node.id() ];
        if( edges != null ) {
            edges.forEach(function (edge) {
                //window.alert([edge.source().id(), edge.target().id()]);
                if (connectedNodes.has(edge.source()) && connectedNodes.has(edge.target())) {
                    connectedEles.merge(edge);
                }
            });
        }
        connectedEles.merge(node);
    });

    return {
        path: cy.collection( connectedEles )
    };
}

var printSet = function(s) {
    var txt = ""
    for (let item of s) txt += item.id() + ",";
    console.log(txt);
}

var printEdge = function(e) {
    console.log("edge: " + e.source().id() + " " + e.target().id() );
}