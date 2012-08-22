## dependency-foo

dependency-foo is a stupid-proof Node.js module that implements a simple Directed Acyclic Graph(DAG)

![Dependency Graph Example](http://upload.wikimedia.org/wikipedia/commons/a/ad/Dependencygraph.png)

### Features

* Compact Serializable State to JSON
* Object().Oriented()
* Fully Tested(with Vows)

### Installation

    $ npm install dependency-foo

### Usage

#### Creating a Graph Instance
	var DependencyGraph = require('dependency-foo');
	var graph = new DependencyGraph();

#### Declaring a Dependency between two nodes

    // The human has now a dependency to the air.
    graph.subject('human').dependsOn('air');

#### Checking Dependencies & Direction

	// I need to know if air is a dependency of human.
	graph.subject('air').isDependencyOf('human');
	=> true

	// I need to know if human has a dependency to the air
	graph.subject('human').hasDependencyTo('air');
	=> true


#### Inspecting Dependencies

Use `references` and `dependencies` to get near references or dependencies:

    // What nodes are referencing 'air' as a dependency?
	graph.subject('air').references
	=> ['human']
	
	// What nodes are dependencies of 'human'?
	graph.subject('human').dependencies
	=> ['air']

Use `allReferences` and `allDependencies` to get all the the related references or dependencies in the graph.

#### Removing a Dependency

	// The human don't want to depend of the air anymore.
	graph.subject('human').drop('air');
	
	graph.subject('human').dependencies
	=> []
	
	// The references are automatically removed.
	graph.subject('air').references
	=> []

#### State and Serialization

Every instance of `DependencyGraph` has an internal state that can be accessed by the `state` property, which returns a JSON safe object that maintains the state of all the nodes of the graph:

	graph.state
	=> {
		human: {
			dps: [ 'air' ],
			refs: []
		},
	  	air: {
			dps: [],
			refs: [ 'human' ]
		}
	}


The state of the graph can be replaced safely with another object:

	graph.state = {} // clear all the nodes of the graph

The state of the graph can be serialized to JSON using the `serialize` method.
	
	graph.serialize()
	=> {"human":{"dps":["air"],"refs":[]},"air":{"dps":[],"refs":["human"]}}
	
To restore the state, you can create another instance of the graph:

	graph = new DependencyGraph(JSON.parse('{"human":{"dps":["air"],"refs":[]},"air":{"dps":[],"refs":["human"]}}'))

Or assigning the `state` property.
	
	graph.state = JSON.parse('{"human":{"dps":["air"],"refs":[]},"air":{"dps":[],"refs":["human"]}}')

#### Cyclic Dependency Detection

dependency-foo will check for cyclic dependencies in the input.

	graph.subject('human').dependsOn('air');
	graph.subject('air').dependsOn('human'); // this is illegal!
	=> Error: Cyclic Dependency Detected
	
	// same happens with sub dependencies
	graph.subject('air').dependsOn('oxygen');
	graph.subject('oxygen').dependsOn('human'); // still illegal!
	=> Error: Cyclic Dependency Detected

### Tests

    npm test


## Disclaimer

Our needs for this module were very specific and we never intended to handle high volume of nodes(1k or more). If you find that this module doesn't fill your performance expectation then you have at least three choices:

1. Improve this module *without breaking the tests and keeping existing method signatures* via making pull requests.
2. Fork this module.
3. Implement your own dependency graph from scratch.

## License (MIT)

Copyright (c) 2012 Firebase.co - http://firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

