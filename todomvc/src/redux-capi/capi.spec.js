import { createAPI, reducer } from './index'
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
const matrixAPISpec2D = {
  redactions: {
    setValue: (row, col, value) => ({
      matrix: {
        where: (state, item, ix) => ix === row,
        _: {
          where: (state, item, ix) => ix === col,
          set: () => value
        }
      }
    }),
    addRow: () => ({
      matrix: {
        append: () => ({cols: []})
      }
    }),
    insertRowAfter: (row) => ({
      matrix: {
        after: () => row,
        insert: () => ({cols: []})
      }
    }),
    insertRowBefore: (row) => ({
      matrix: {
        before: () => row,
        insert: () => ({cols: []})
        }
    }),
    insertColAfter: (row) => ({
      matrix: {
        where: (state, item, ix) => ix === row,
        _: {
          after: () => row,
          insert: () => ({cols: []})
        }
      }
    }),
    insertColBefore: (row) => ({
      matrix: {
        where: (state, item, ix) => ix === row,
        _: {
          Before: () => row,
          insert: () => ({cols: []})
        }
      }
    }),
    addCol: (row) => ({
      matrix: {
        where: (state, item, ix) => ix === row,
        cols: {
          append: () => ({})
        }
      }
    }),
   },
  selectors: {
    matrix: (api,state) => state.matrix
  },
  thunks: {
    set: ({matrix, addRow, addCol, setValue}) => (row, col, value) => {
      let rowsToAdd = row - matrix.rows.length + 1;
      while(rowsToAdd--)
        addRow();
      let colsToAdd = col - (matrix.rows[row] || []).length + 1;
      while(colsToAdd--)
        addCol(row);
      setValue(row, col, value);
    }
  }
}
const matrixAPISpec = {
  redactions: {
    setValue: (row, col, value) => ({
      matrix: {
        rows: {
            where: (state, item, ix) => ix === row,
            cols: {
                where: (state, item, ix) => ix === col,
                set: () => value
              }
            }
          }
    }),
    addRow: () => ({
      matrix: {
        rows: {
          append: () => ({cols: []})
        }
      }
    }),
    insertRowAfter: (row) => ({
      matrix: {
        rows: {
          after: () => row,
          insert: () => ({cols: []})
        }
      }
    }),
    insertRowBefore: (row) => ({
      matrix: {
        rows: {
          before: () => row,
          insert: () => ({cols: []})
        }
      }
    }),
    insertColAfter: (row) => ({
      matrix: {
        rows: {
          where: (state, item, ix) => ix === row,
          cols: {
            after: () => row,
            insert: () => ({cols: []})
          }
        }
      }
    }),
    insertColBefore: (row) => ({
      matrix: {
        rows: {
          where: (state, item, ix) => ix === row,
          cols: {
            before: () => row,
            insert: () => ({cols: []})
          }
        }
      }
    }),
    addCol: (row) => ({
      matrix: {
        rows: {
          where: (state, item, ix) => ix === row,
          cols: {
            append: () => ({})
          }
        }
      }
    }),
  },
  selectors: {
    matrix: (api,state) => state.matrix
  },
  thunks: {
    set: ({matrix, addRow, addCol, setValue}) => (row, col, value) => {
      let rowsToAdd = row - matrix.rows.length + 1;
      while(rowsToAdd--)
        addRow();
      let colsToAdd = col - (matrix.rows[row] || []).length + 1;
      while(colsToAdd--)
        addCol(row);
      setValue(row, col, value);
    }
  }
}
const shape = {matrix: {rows: []}};
let setState;
const component = {setState(state) {setState = state}};
function getAPI () {
  const store = createStore(reducer, shape, applyMiddleware(ReduxThunk));
  const api = createAPI(matrixAPISpec);
  api.mount(store);
  return api;
}
describe('CAPI', () => {
  describe('bindAPI', () => {
    it('should setup componentContext', () => {
      const api = getAPI();
      const apiContext = api._getContext();
      expect(typeof apiContext.setValue).toBe("function");
      expect(typeof apiContext.addRow).toBe("function");
      expect(typeof apiContext.set).toBe("function");
      expect(typeof Object.getOwnPropertyDescriptor(apiContext, 'matrix').get).toBe("function");
      expect(apiContext.__store__).toBe(api._getStore());
    })
    it('should create api', () => {
      const api = getAPI();
      const componentContext = api({},{});
      expect(typeof componentContext.setValue).toBe("function");
      expect(typeof componentContext.addRow).toBe("function");
      expect(typeof componentContext.set).toBe("function");
      expect(typeof Object.getOwnPropertyDescriptor(componentContext.__proto__, 'matrix').get).toBe("function");
    })
    it('track selectors', () => {
      const api = getAPI();
      {
        let {__selector_used__, matrix, set} = api({},component);
        expect(matrix.rows.length).toBe(0);
        expect(__selector_used__['matrix'].rows.length).toBe(0);
        set(0, 0, "zero-zero");
        expect(api._getStore().getState().matrix.rows[0].cols[0]).toBe("zero-zero");
      } {
        let {matrix} = api({},{setState(state) {setState = state}});
        expect(matrix.rows[0].cols[0]).toBe("zero-zero");
      }
    })
  })
})
