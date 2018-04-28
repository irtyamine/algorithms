const tracer = new GraphTracer();
const logger = new LogTracer();
tracer.log(logger);
const G = [ // G[i][j] indicates whether the path from the i-th node to the j-th node exists or not
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
tracer.set(G, GraphData.LAYOUT.TREE, 0);


// This is a sample DLS applications where
// we try to find number of descendant of root within some depth
function DLSCount(limit, node, parent) { // node = current node, parent = previous node
  tracer.visit(node, parent).wait();
  let child = 0;
  if (limit > 0) { // cut off the search
    for (let i = 0; i < G[node].length; i++) {
      if (G[node][i]) { // if current node has the i-th node as a child
        child += 1 + DLSCount(limit - 1, i, node); // recursively call DLS
      }
    }
    return child;
  }
  return child;
}
logger.print(`Number of descendant is ${DLSCount(2, 0)}`);
