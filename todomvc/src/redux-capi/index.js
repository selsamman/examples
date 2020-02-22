import { useRef, useState } from 'react';

export const createAPI = ({selectors, thunks, redactions}) => {

  // Internal component API context
  let apiContext = {
    __store__ : undefined,    // redux store will be filled by mount()
  };

  // Process inputs
  for (let prop in selectors || {})
      processSelector(prop, selectors[prop]);

  for (let prop in thunks || {})
      processThunk(prop, thunks[prop])

  for (let prop in redactions || {})
      processRedaction(prop, redactions[prop]);

  // Prepare return value which is the api itself which is called to create a component instance of the api
  const api =  (contextProps, componentInstance) => {
    let context;
    // We have two modes of operastion depending on whethe classes or functions are used for the component
    if (!componentInstance) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      let contextContainer = useRef(null);
      if (contextContainer.current) {
        // Restore context from reference
        context = contextContainer.current;
        context.__render_count__++; // We don't have a true render count so use calls to api as proxy
      } else {
        // Create a new context for this instance of the api's use in a component.
        contextContainer.current = context = Object.create(apiContext);
        // Since selectors depend on "this" we bind them so they can be called as simple functions
        bindFunctions(context);
        context.__render_count__ = 0;
      }
      // Set up a set state function that can trigger a render by modifying the state
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [, setSeq] = useState(1);
      context.__force_render__ = () => setSeq(context.__render_count__);
    } else {
      if (componentInstance.__capi_instance__) {
        // retrieve context from a component property
        context = componentInstance.__capi_instance__;
        context.__render_count__++;
      } else {
        // Create a new context for this instance of the api's use in a component.
        componentInstance.__capi_instance__ = context = Object.create(apiContext);
        // setup a function to force a render by modifying the state
        context.__render_count__ = 0;
        context.__force_render__ = () => componentInstance.setState({__render_count__: context.__render_count__});
        // Since selectors depend on "this" we bind them so they can be called as simple functions
        bindFunctions(context);
      }
    }
    Object.assign(context, contextProps ? contextProps : {});
    context.__selector_used__ = {};
    return context;
  }

  api.mount = (store, stateMap) => {
    apiContext.__store__ = store;
    apiContext.__state_map__ = stateMap;
  }

  api._getContext = () => apiContext; // For testing
  api._getStore = () => apiContext.__store__;
  return api;

  // Utility functions that use apiContext in their closures

  function processSelector (prop, selectorDef) {
    if (selectorDef instanceof  Array) {
      // For array definition of selector we capture and momize the selector
      let memoizedSelector = memoize(selectorDef[1]);
      let memoizedInvoker = selectorDef[0];
      // Create a getter that will invoke the invoker function and track the ref
      Object.defineProperty(apiContext, prop, {get: function () {
          const value = memoizedInvoker.call(null, memoizedSelector, this);
          selectorReferenced(this, prop, value);
          return value;
        }});
    } else
      // For a simple selector create a getter that just invokes the selector
      Object.defineProperty(apiContext, prop, {get: function () {
          const value = selectorDef.call(null, this.__store__.getState(), this);
          selectorReferenced(this, prop, value);
          return value;
      }});

    function selectorReferenced (apiInstance, prop, value) {
      apiInstance.__selector_used__[prop] = value;
      if (!apiInstance.__store_state_subscription__)
        apiInstance.__store_state_subscription__ = apiInstance.__store__.subscribe(() => {
          console.log(JSON.stringify(apiInstance.__store__.getState()));
          for (let selectorProp in apiInstance.__selector_used__)
            if (apiInstance[selectorProp] !== apiInstance.__selector_used__[prop]) {
              forceRender(apiInstance);
              return;
            }
        });
    }

    function forceRender (apiInstance) {
      apiInstance.__force_render__();
      // Update state with latest render count
      apiInstance.__store_state_subscription__();  // Unsubscribe
      apiInstance.__store_state_subscription__ = undefined;
    }

    function memoize(selector) {
      let lastArguments = [];
      let lastResult = null;
      function getValue() {
        if (!firstLevelEqual(lastArguments, arguments))
          lastResult = selector.apply(null, arguments);
          lastArguments = arguments;
          return lastResult;
      };
      return getValue;
      function firstLevelEqual(obj1, obj2) {
        if (obj1.length !== obj2.length)
          return false;
        for (let prop in obj1)
          if (obj1[prop] !== obj2[prop])
            return false;
        return true;
      }
    }
  }

  function processThunk (prop, element) {
    apiContext[prop] = function() {
      let originalArguments = arguments;
      this.__store__.dispatch((dispatch, getState) => {
        element.call(null, this, getState()).apply(null, originalArguments);
      });
    }
  }

  function processRedaction (prop, actionFunction) {
     apiContext[prop] = function() {
      var action = actionFunction.apply(null, arguments);
      this.__store__.dispatch({type: 'Redaction', name: prop, reducer: {...action}, context: this, stateMap: apiContext.__state_map__});
    }
  }

  function bindFunctions (obj) {
    for (let prop in obj)
      if (typeof obj[prop] === "function")
        obj[prop] = obj[prop].bind(obj)
  }

}
export const reducer = (rootState, action) => {

    if (action.type !== 'Redaction')
      return rootState;

    // Process each high level state property
    let accumulator = { reactions: action.reducer, oldState: rootState, newState: {} };
    return Object.getOwnPropertyNames(rootState).reduce(reducer, accumulator).newState;

    // Process state node (arrays normalized to return indes in value parameter)
    function reducer(accumulator, propOrIndex) {

      const oldState = accumulator.oldState[propOrIndex];
      let newState = oldState;

      // Determine whether this node is to be processed or bypassed
      let processChildNodes = false;
      let children = {};
      for (let childReactionNode in accumulator.reactions || {}) {

        // Match up the state with the reaction node and decide if we need to process it.  In the case of
        // stepping through array elements you could have more than one that matched
        const reactionNode = evaluate(accumulator.reactions, childReactionNode, newState, propOrIndex);

        // Process the node?
        if (reactionNode) {
          // execute any actions (set, delete, append, insert etc)
          newState = execute(reactionNode, newState);
          if (reactionNode.children) {
            processChildNodes |= true;
            Object.assign(children, reactionNode.children);
          }
        }
      }
      // If we have a reaction defined for this slice of the hierarchy we must copy state
      if (processChildNodes) {
        let subAccumulator;
        if (newState instanceof Array)
            subAccumulator =  oldState.reduce(arrayReducer, { oldState: newState, newState: [], reactions: children });
        else
            subAccumulator = Object.getOwnPropertyNames(oldState).reduce(reducer, { oldState: newState, newState: {}, reactions: children });

        // Trim nulls and undefined values out of arrays if needed
        if (subAccumulator.filterArray)
          newState = subAccumulator.newState.filter((item) => (item !== null && typeof item !== 'undefined'));
        else
          newState = subAccumulator.newState;
      }

      // For array elements that result in undefined we want to alert the top level that a filter may be necessary
      if ((accumulator.oldState instanceof Array && typeof newState === 'undefined') || newState === null)
        accumulator.filterArray = true;

      // If we have reducers for this slice we pass the old state to the reducers one at a time
      // and expect them to return a new state for this slice of the tree
      accumulator.newState[propOrIndex] = newState;

      return accumulator;
    }
    // Normalize object and a array reduction so we allways have and index into the state being copied
    function arrayReducer(accumulator, currentValue, currentIndex) {
      return reducer(accumulator, currentIndex);
    }
    // Execute the reducer function
    function execute(reducer, newState) {
      const context = action.context;
      if (reducer.set) {
        return reducer.set.call(null, mapState(rootState), newState, context);
      } else if (reducer.append) {
        return newState.concat(reducer.append.call(null, mapState(rootState), context));
      } else if (reducer.insert) {
        let position = newState.length;
        if (reducer.after)
          position = reducer.after.call(null, mapState(rootState), context) + 1;
        if (reducer.before)
          position = Math.max(reducer.before.call(null, mapState(rootState), context), 0);
        var insertResult = reducer.insert.call(null, mapState(rootState), context);
        var shallowCopy = newState.slice();
        shallowCopy.splice(position, 0, insertResult);
        return shallowCopy;
      } else if (reducer.assign) {
        return Object.assign({}, newState, reducer.assign.call(null, mapState(rootState), newState, context));
      } else if (reducer.delete) {
        return undefined;
      } else
        return newState
    }

    // Returns a result with all the commands as properties, an array of children reaction nodes to be processed
    // assuming the reaction node matches the state property name or in the case of an array matches the array
    // element as evaluated by calling out to the where function.  When processing the array itself we have
    // to push the reaction node into the children array so it will be processed when the elements are evaluated
    function evaluate(reactionNode, reactionNodeKey, element, propOrIndex) {

      // Make sure reaction node matches state property name (unless processing an array)
      if (typeof propOrIndex != "number" && reactionNodeKey !== propOrIndex)
        return null;

      const result = {};
      for (let key in reactionNode[reactionNodeKey]) {
        const reactionNodeValue = reactionNode[reactionNodeKey][key];

        // Are we dealing with array or array element
        if (typeof reactionNodeValue === "function"  && key === "where") {
          if (typeof propOrIndex !== "number") // An array?
            // Push this reaction node into children to be evaluated as array elements are stepped through
            return {children: reactionNode}

          // Otherwise and array instance and we eveluate if this is the correct instance
          if (reactionNode.noMap) {  // If these nodes at root (from stateMap) don't map state passed in
            if (!reactionNodeValue.call(null, rootState, element, propOrIndex, action.context))
              return null;
          } else {
            if (!reactionNodeValue.call(null, mapState(rootState), element, propOrIndex, action.context))
              return null;
          }
          continue; // Don't add where
        }
        // These are commands to be executed
        if ( typeof reactionNodeValue !== "object")
          result[key] = reactionNodeValue;
        else { // Otherwise just child reactionNodes
          if (!result.children)
            result.children = {}
          result.children[key] = reactionNodeValue;
        }
      }
      return result;
    }
    /**
     * Substitute state map into top level state
     * @param topLevelState
     * @param stateMap
     * @param action
     */
    function mapState(rootState) {
      return mapStateMap(rootState, action.stateMap);
    }
};

function mapStateMap(rootState, stateMap) {
  if (stateMap) {
    var newState = Object.assign({}, rootState);
    for (var stateProp in stateMap)
      newState[stateProp] = evaluateState(stateMap[stateProp])
    return newState;
  } else
    return rootState;

  function evaluateState(stateSlices) {
    var stateSlice = rootState
    stateSlices.map((sliceComponent) => {
      if (typeof sliceComponent == 'function') {
        if (stateSlice instanceof Array)
          stateSlice = stateSlice.find((item, index) => sliceComponent.call(null, rootState, item, index));
        else {
          var stateSliceProps = Object.getOwnPropertyNames(stateSlice);
          var stateSliceProp = stateSliceProps.find((prop)=> sliceComponent.call(null, rootState, stateSlice[prop]))
          stateSlice = stateSlice[stateSliceProp];
        }
      } else {
        stateSlice = stateSlice[sliceComponent];
      }
      return undefined; // Not interested in results of map
    });
    return stateSlice;
  }
}

