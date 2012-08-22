## dependency-foo

dependency-foo is a stupid-proof Node.js module that implements a General Purpose [Dependency Graph](http://en.wikipedia.org/wiki/Dependency_graph).

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

    // What nodes are referencing 'air' as a dependency?
	graph.subject('air').references
	=> ['human']
	
	// What nodes are dependencies of 'human'?
	graph.subject('human').dependencies
	=> ['air']

#### Removing a Dependency

	// The human don't want to depend of the air anymore.
	graph.subject('human').drop('air');
	
	graph.subject('human').dependencies
	=> []
	
	// The references are automatically removed.
	graph.subject('air').references
	=> []


### Tests

    npm test


## License (MIT)

Copyright (c) 2012 Firebase.co - http://firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

