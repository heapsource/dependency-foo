var vows = require('vows');
var assert = require('assert');
var DependencyGraph = require('../');

vows.describe('dg.js').addBatch({
  "the module export shuld be a function": function() {
    assert.isFunction(DependencyGraph);
    assert.strictEqual(DependencyGraph.name, 'Graph');
  },
  "When I add 'drug' as a dependency of 'human'": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('human').dependsOn('drug');
      return graph;
    },
    "Then the node 'human'": {
      topic: function(graph) { 
        return graph.subject('human');
      },
      "should be a dependent of 'drug'": function(node) {
        // This guy is a drug addict xD
        assert.isTrue(node.hasDependencyTo('drug'));
      },
      "should report 'drug' as the only dependency": function(node) {
        assert.deepEqual(node.dependencies, ['drug']);
      }
    },
    "And the node 'drug'": {
      topic: function(graph) {
        return graph.subject('drug');
      },
      "should be a dependency of 'human'": function(drug) {
        // this drug just got a new human :)
        assert.isTrue(drug.isDependencyOf('human'));
      },
      "should report 'human' as the only reference": function(node) {
        assert.deepEqual(node.references, ['human']);
      }
    }
  },
  "When I have a dependency already established": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('human').dependsOn('drug');
      return graph;
    },
    "And I repeat the call that adds the dependency": {
      topic: function(graph) {
        return graph.subject('human').dependsOn('drug');
      },
      "Then the dependency should not be repeated": function(human) {
        assert.deepEqual(human.dependencies, ['drug']);
      }
    }
  },
  "When I add 'drug', 'air' and 'food' dependencies of 'human'": {
    topic: function() {
      var graph = new DependencyGraph();
      return graph.subject('human').dependsOn('drug').dependsOn('air').dependsOn('food');
    },
    "Then all the dependencies should be listed as dependencies": function(human) {
      assert.deepEqual(human.dependencies, ['drug', 'air', 'food']);
    },
    "And a references to the 'human'": {
      "must exist in 'drug'": function(human) {
        assert.deepEqual(human.graph.subject('drug').references, ['human']);
      },
      "also in 'air'": function(human) {
        assert.deepEqual(human.graph.subject('air').references, ['human']);
      },
      "and 'food' as well": function(human) {
        assert.deepEqual(human.graph.subject('food').references, ['human']);
      }
    }
  },
  "Having 'drug', 'air' and 'food' as dependencies of 'human'": {
    topic: function() {
      var graph = new DependencyGraph();
      // we add another dependencies to 'air' so we check that 'drop' only removes 'human' references of 'air'
      graph.subject('plant').dependsOn('air');
      graph.subject('animal').dependsOn('air');
      return graph.subject('human').dependsOn('drug').dependsOn('air').dependsOn('food');
    },
    "If then I remove 'air' and 'drug'": {
      topic: function(human) {
        return human.drop('air').drop('drug');
      },
      "Then the only dependency left should be 'food'": function(human) {
        assert.deepEqual(human.dependencies, ['food']);
      },
      "And 'air'": {
        topic: function(human) {
          var graph = human.graph;
          return graph.subject('air');
        }, 
        "Should not have a reference to 'human'": function(air) {
          assert.deepEqual(air.references, ['plant','animal']);
        }
      },
      "And 'drug'": {
        topic: function(human) {
          return human.graph.subject('drug');
        }, 
        "Should not have a reference to 'human'": function(drug) {
          assert.deepEqual(drug.references, []);
        }
      }
    }
  },
  "When I serialize a graph with nodes": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('air').dependsOn("oxigen");
      graph.subject('air').dependsOn("hidrogen");
      graph.subject('human').dependsOn("air");
      graph.subject('fire').dependsOn("oxigen");
      graph.subject('animal').dependsOn("air");
      return graph.serialize();
    },
    "The serialized graph state should be an object with properties per each node with sub properties dps and refs only": function(data) {
      assert.deepEqual(JSON.parse(data), {
        animal: { 
          refs: [], 
          dps: [ 'air' ] 
        }, 
        oxigen: { 
          refs: [ 'air', 'fire' ], 
          dps: [] 
        }, 
        human: { 
          refs: [], 
          dps: [ 'air' ] 
        }, 
        air: { 
          refs: [ 'human', 'animal' ], 
          dps: [ 'oxigen', 'hidrogen' ] 
        }, 
        hidrogen: { 
          refs: [ 'air' ], 
          dps: [] 
        }, 
        fire: { 
          refs: [], 
          dps: [ 'oxigen' ] 
        } 
      });
    }
  },
  "When I initialize a graph with a serialized state": {
    topic: function() {
      var graph = new DependencyGraph({
        animal: { 
          refs: [], 
          dps: [ 'air' ]
        },
        air: { 
          refs: [ 'animal' ], 
          dps: [] 
        },
      });
      return graph;
    },
    "I should be able to perform operations normally": function(graph){
      assert.isTrue(graph.subject('air').isDependencyOf('animal'));
    }
  },
  "Having a graph with multiple nested references": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('B.first').dependsOn('A');
      graph.subject('B.middle').dependsOn('A');
      graph.subject('B.last').dependsOn('A');
      graph.subject('C').dependsOn('B.first');
      graph.subject('C').dependsOn('B.middle');
      graph.subject('C').dependsOn('B.last');
      graph.subject('D').dependsOn('B');
      graph.subject('D').dependsOn('C');
      return graph;
    },
    "allReferences should return all the references in the right order and with unique elements": function(graph){
      assert.deepEqual(graph.subject('A').allReferences, ['B.first','B.middle', 'B.last', 'C', 'D']);
    }
  },
  "Having a graph with multiple nested dependencies": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('B.first').dependsOn('A');
      graph.subject('B.middle').dependsOn('A');
      graph.subject('B.last').dependsOn('A');
      graph.subject('C').dependsOn('B.first');
      graph.subject('C').dependsOn('B.middle');
      graph.subject('C').dependsOn('B.last');
      graph.subject('D').dependsOn('B');
      graph.subject('D').dependsOn('C');
      return graph;
    },
    "allReferences should return all the references in the right order and with unique elements": function(graph){
      assert.deepEqual(graph.subject('D').allDependencies, ['B', 'C', 'B.first','B.middle', 'B.last', 'A']);
    }
  },
  "If I try to add a dependency to the same node": {
    topic: function() {
      var graph = new DependencyGraph();
      return graph;
    },
    "Then I should receive an error with message 'Cyclic Dependency Detected'": function(graph) {
      assert.throws(function() {
        graph.subject('B').dependsOn('B');
      });
      try {
        graph.subject('B').dependsOn('B');
      } catch(e) {
        assert.equal(e.message, 'Cyclic Dependency Detected');
      }
    }
  },
  "If I try to add a dependency to the same node in a sub-dependency": {
    topic: function() {
      var graph = new DependencyGraph();
        graph.subject('B').dependsOn('A');
      return graph;
    },
    "Then I should receive an error with message 'Cyclic Dependency Detected'": function(graph) {
      assert.throws(function() {
        graph.subject('A').dependsOn('B');
      });
      try {
        graph.subject('A').dependsOn('B');
      } catch(e) {
        assert.equal(e.message, 'Cyclic Dependency Detected');
      }
      graph.subject('C').dependsOn('B');
      assert.throws(function() {
        graph.subject('A').dependsOn('C');
      });
    }
  },
  "Having a graph with 4 nodes": {
    topic: function() {
      var graph = new DependencyGraph();
      graph.subject('A','B');
      graph.subject('B','C');
      graph.subject('C','D');
      graph.subject('D','F');
      return graph;
    },
    "all should return all the nodes in the graph": function(graph) {
      assert.equal(graph.all.length, 4);
    }
  }
}).run();
