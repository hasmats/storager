## Basic usage

```javascript
import React, { Component } from 'react';

// Import Storager
import Storager from 'storager';

// Setup new store with some initial data
const storager = new Storager({
	text: 'My text'
});

// Register an action
storager.registerAction((store, action) => {
	if(action.name === 'setText') {
		return {text: action.value};
	}
});

// Simple component
class App extends Component {
	constructor(props) {
		super(props);

		// Setup initial state
		this.state = storager.getStore();

		this.onUpdate = store => this.setState(store);

		// Subscribe to updates
		storager.subscribe(this.onUpdate);
	}
	componentWillUnmount() {
		// Unsubscribe when component will unmount
		storager.unsubscribe(this.onUpdate)
	}
	render() {
		return (
			<div className='App'>
				<input type='text' value={this.state.text} onChange={e => storager.action({name: 'setText', value: e.target.value})} />
				<button type='button' onClick={() => storager.action({name: 'setText', value: 'banana'})}>Set to banana</button>
			</div>
		);
	}
}

export default App;
```