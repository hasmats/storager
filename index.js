
export default class Storager {
	// TODO: Add options argument
	// {strict: true} => if you try to set undefined key throw error
	// {history: true} => saves all states of the store. Good for debugging
	constructor(initialStore) {
		this.name = 'Storager';
		this.__subscriptions = 0;
		this.__actions = 0;

		const actionsArray = [];
		const listeners = [];
		let store = initialStore || {};
		
		const error = e => {
			throw new Error(`Storager: ${e}`);
		};

		const getCopy = source => {
			return JSON.parse(JSON.stringify(source));
		};

		this.subscribe = fn => {
			if(typeof fn !== 'function') {
				error('Subscriber needs to be a function');
			}
			if(listeners.indexOf(fn) !== -1) {
				error('Trying to subscribe the same function twice');
			}
			this.__subscriptions++;
			listeners.push(fn);
		};
		this.unsubscribe = fn => {
			const i = listeners.indexOf(fn);
			if(i === -1) {
				error('Function is not subscribed');
			}
			this.__subscriptions--;
			listeners.splice(i, 1);
		};

		const getNewStore = action => {
			let newStore = getCopy(store);
			let changed = false;
			actionsArray.forEach(actionFn => {
				const data = actionFn(newStore, action);
				if(data && typeof data !== 'object') {
					error('New store was not an object');
				}
				if(data) {
					changed = true;
					newStore = Object.assign({}, store, data);
				}
			});

			return changed ? newStore : undefined;
		};

		this.action = action => {
			// iterate action functions
			const newStore = getNewStore(action);

			if(!newStore) {
				return;
			}

			store = newStore;

			listeners.forEach(fn => {
				fn(store);
			});
		};

		this.registerAction = fn => {
			if(typeof fn !== 'function') {
				throw new Error(`${this.name}: action needs to be a function`);
			}
			this.__actions++;
			actionsArray.push(fn);
		};

		this.getStore = () => {
			return getCopy(store);
		};

		// TODO
		// Reset the store with new initial data
		// this.reset = () => {}

		// TODO
		// Unsubscribe all listeners
		// this.destroy = () => {}
	}
}