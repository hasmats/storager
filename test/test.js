import assert  from 'assert';
import Storager from '../index';

describe('Storager', () => {

	describe('#constructor()', () => {
		const dataStore = new Storager();
		it('should have 0 subs', () => {
			assert.equal(dataStore.__subscriptions, 0, 'subscriptions was not 0');
		});
		it('should have 0 actions', () => {
			assert.equal(dataStore.__actions, 0, 'actions was not 0');
		});
		it('should have all functions', () => {
			const expectedFn = ['getStore','registerAction','subscribe','unsubscribe','action'];
			expectedFn.forEach(fn => {
				assert.equal(typeof dataStore[fn], 'function', `${fn} was not a function`);
			});
		});
	});


	describe('#getStore()', () => {
		const initialStore = {
			foo: 0,
			bar: 0,
			nested: {
				foo: 0,
				bar: 0
			},
			array: [{bar:1},{bar:2},{bar:3}]
		};
		const dataStore = new Storager(initialStore);
		it('should get store value', () => {
			const storeData = dataStore.getStore();
			assert.deepEqual(storeData, initialStore, 'store was not the same as initial data');
		});
		it('should get unmodified store value', () => {
			const storeData = dataStore.getStore();
			storeData.baz = 1;
			storeData.bar = 1;
			assert.deepEqual(dataStore.getStore(), initialStore, 'store have changed');
		});
		it('should get unmodified nested store value', () => {
			const storeData = dataStore.getStore();
			storeData.nested.bar = 1;
			storeData.nested.baz = 1;
			assert.deepEqual(dataStore.getStore(), initialStore, 'store have changed');
		});
		it('should get unmodified array store value', () => {
			const storeData = dataStore.getStore();
			initialStore.array[0].bar = 55;
			storeData.array[1].bar = 22;
			assert.deepEqual(dataStore.getStore(), initialStore, 'store have changed');
		});
	});


	describe('#registerAction()', () => {
		it('should add action to store', () => {
			const dataStore = new Storager();
			dataStore.registerAction(() => {});
			assert.equal(dataStore.__actions, 1, 'action was not added');
		});
		it('should reject non-function', () => {
			const dataStore = new Storager();
			assert.throws(() => dataStore.registerAction('i am not a function'), Error, 'did not throw an error');
			assert.equal(dataStore.__actions, 0, 'actions was not 0');
		});
	});


	describe('#subscribe()', () => {
		it('should subscribe to the store', () => {
			const dataStore = new Storager();
			dataStore.subscribe(() => {});
			assert.equal(dataStore.__subscriptions, 1, 'expect subscriptions to be one more');
		});
		it('should reject non-function', () => {
			const dataStore = new Storager();
			assert.throws(() => dataStore.subscribe(true), Error, 'did not throw an error');
			assert.equal(dataStore.__subscriptions, 0, 'subscriptions was not 0');
		});
		it('should reject duplecates', () => {
			const dataStore = new Storager();
			const listener = () => {};
			dataStore.subscribe(listener);
			assert.throws(() => dataStore.subscribe(listener), Error, 'did not throw an error');
			assert.equal(dataStore.__subscriptions, 1, 'subscriptions was not 1');
		});
		it('should run on action', () => {
			let counter = 0;
			const dataStore = new Storager();
			dataStore.registerAction(() => {
				return {};
			});
			dataStore.subscribe(() => {
				counter++;
			});
			dataStore.action();
			assert.equal(counter, 1, 'listener was not triggered');
		});
	});


	describe('#unsubscribe()', () => {
		it('should subscribe and unsubscribe to the store', () => {
			const dataStore = new Storager();
			const listener = () => {};
			dataStore.subscribe(listener);
			assert.equal(dataStore.__subscriptions, 1, 'subscriptions was not 1');
			dataStore.unsubscribe(listener);
			assert.equal(dataStore.__subscriptions, 0, 'subscriptions was not 0');
		});
		it('should reject non subscriber', () => {
			const dataStore = new Storager();
			const noListener = () => {};
			assert.throws(() => dataStore.unsubscribe(noListener), Error, 'did not throw an error');
		});
	});


	describe('#action()', () => {
		it('should update the store', () => {
			let counter = 0;
			const initialStore = {foo: 0, bar: 0};
			const dataStore = new Storager(initialStore);
			dataStore.registerAction((store, value) => {
				counter++;
				return {foo: value};
			});
			dataStore.action(1);
			assert.equal(initialStore.foo, 0, 'initialStore was modified');
			assert.equal(counter, 1, 'listener was not triggered once');
			assert.deepEqual(dataStore.getStore(), {foo: 1, bar: 0}, 'store did not change');
		});
		it('should update the store 100 times', () => {
			let counter = 0;
			const initialStore = {foo: 0, bar: 0};
			const dataStore = new Storager(initialStore);
			dataStore.registerAction(store => {
				counter++;
				return {foo: ++store.foo};
			});
			for (var i = 100; i > 0; i--) {
				dataStore.action();
			}
			assert.equal(counter, 100, 'listener was not triggered 100 times');
			assert.equal(initialStore.bar, 0, 'initialStore was modified');
			assert.deepEqual(dataStore.getStore(), {foo: 100, bar: 0}, 'store did not change');
		});
		it('should run but not return a new store', () => {
			const dataStore = new Storager({foo: 1});
			let counter = 0;
			dataStore.registerAction(() => {
				counter++;
				// I will do nothing
			});
			dataStore.action();
			assert.equal(counter, 1, 'listener was not triggered');
			assert.deepEqual(dataStore.getStore(), {foo: 1}, 'store did not change');
		});
		it('should not modify the store in actions', () => {
			const dataStore = new Storager({foo: 1, bar: 1, nested: {foo: 1}});
			dataStore.registerAction(store => {
				store.foo = 30;
				store.nested.foo = 30;

				return {bar: 2};
			});
			dataStore.action();
			assert.deepEqual(dataStore.getStore(), {foo: 1, bar: 2, nested: {foo: 1}}, 'store did not change');
		});
		it('should throw error when non-object is returned', () => {
			const dataStore = new Storager({foo: 1, bar: 1});
			dataStore.registerAction(() => {
				return 'my new store';
			});
			assert.throws(() => dataStore.action(), Error, 'did not throw an error');
		});

		// test undefined action
	});
});