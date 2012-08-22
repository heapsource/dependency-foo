// Copyright (c) 2012 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

function GraphNode_dependOn(nodeId) {

  // check if already has this dependency
  if(this.dependencies.indexOf(nodeId) != -1) {
    return this;
  }

  var dependencyNode = this.graph.subject(nodeId);

  // look for a reflecting dependency node what could cause a cyclic dependency
  if(this.id == nodeId || dependencyNode.allDependencies.indexOf(this.id) != -1) {
    throw new Error('Cyclic Dependency Detected');
  }

  // the target has now a reference to this module
  dependencyNode.references.push(this.id); 

  // save a local dependency to the target
  this.dependencies.push(nodeId);

  return this;
}

function GraphNode_hasDependencyTo(nodeId) {
  return this.allDependencies.indexOf(nodeId) != -1;
}

function GraphNode_isDependencyOf(nodeId) {
  return this.allReferences.indexOf(nodeId) != -1;
}

function GraphNode_drop(nodeId) {
  // check if the target is a dependency
  if(this.dps.indexOf(nodeId) == -1) {
    return this;
  }
  // the target should no longer reference to this node
  var dependencyNode = this.graph.subject(nodeId);
  dependencyNode.references.splice(dependencyNode.references.indexOf(this.id),1); 

  // remove the local dependency against the target
  this.dps.splice(this.dependencies.indexOf(nodeId), 1);

  return this;
}

// Converts a regular object to a node with operations and stuff..
function createNode(graph, id, node) {
  var node = node || {};
  node.dps = node.dps || []; // dependencies of this node (serialized)
  node.refs = node.refs || []; // references to this node (serialized)

  // We all of these properties and functions this way because we don't want them to be serialized.
  Object.defineProperty(node, 'id', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: id
  });

  Object.defineProperty(node, 'graph', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: graph
  });

  Object.defineProperty(node, 'dependOn', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: GraphNode_dependOn
  });

  Object.defineProperty(node, 'hasDependencyTo', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: GraphNode_hasDependencyTo
  });

  Object.defineProperty(node, 'isDependencyOf', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: GraphNode_isDependencyOf
  });

  Object.defineProperty(node, 'references', {
    configurable: false,
    enumerable: false,
    get: function() {
      return this.refs;
    }
  });

  function recursiveOrderedVisit(node, collection) {
      var list = [];
      function visit(n) {
        n[collection].forEach(function(depId) {
          var dep = graph.subject(depId);
          if(list.indexOf(dep.id) != -1) {
            // if the node was already added to the list, we have to re-add it because the dependency has lower procedence
            list.splice(list.indexOf(dep.id), 1);
          }
          list.push(dep.id);
          visit(dep);
        });
      }
      visit(node);
      return list;
  }

  Object.defineProperty(node, 'allReferences', {
    configurable: false,
    enumerable: false,
    get: function() {
      return recursiveOrderedVisit(this, 'references');
    }
  });

  Object.defineProperty(node, 'dependencies', {
    configurable: false,
    enumerable: false,
    get: function() {
      return this.dps;
    }
  });

  Object.defineProperty(node, 'allDependencies', {
    configurable: false,
    enumerable: false,
    get: function() {
      return recursiveOrderedVisit(this, 'dependencies');
    }
  });

  Object.defineProperty(node, 'drop', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: GraphNode_drop
  });

  return node;
}

/*
 * Creates a Graph. Optionally it can receive the state of a previously serialized graph.
 */
function Graph(state) {
  var _state = null;
  Object.defineProperty(this, 'state', {
    enumerable: true, // let the state be enumerated for debugging purposes.
    get: function() {
      return _state
    },
    set: function(state) {
      if(typeof(state) !== 'object') {
        throw new Error("Graph state must be an object");
      }

      // Hidrate the Nodes with properties and methods
      Object.keys(state).forEach(function(nodeId) {
        state[nodeId] = createNode(this, nodeId, state[nodeId]);
      }, this);
      _state = state;
    }
  });
  this.state = state || {};
}

/*
 * Retrieves a Node to work with. If the node does not exist, it will be created.
 */
Graph.prototype.subject = function subject(id) {
  if(!id) {
    throw new Error('subject id is required');
  }
  // ensure subject
  var subject = this.state[id];
  if(!subject) {
    subject = this.state[id] = createNode(this, id);
  }
  return subject;
};

/*
 * JSON Stringify the state of the graph.
 */
Graph.prototype.serialize = function serialize() {
  return JSON.stringify(this.state);
}

/*
* Returns all the nodes in the graph with no specific order.
* */
Object.defineProperty(Graph.prototype, 'all', {
  get: function() {
    var list = [];
    Object.keys(this.state).forEach(function(nodeId) {
      list.push(this.state[nodeId]);
    }, this);
    return list;
  }
});

module.exports = Graph;
