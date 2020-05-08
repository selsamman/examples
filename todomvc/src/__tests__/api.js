import {todoAPI, todoAPISpec} from "../capi";
import {initialState} from "../capi/initialState";
import {createAPI, reducer, validation} from "redux-capi";
import { applyMiddleware, createStore, compose } from 'redux'
import ReduxThunk from 'redux-thunk'
import {SHOW_COMPLETED} from "../capi/TodoFilters";

describe("api tests", () => {
    let todoAPI;
    let component = {}
    it ("can validate", () => {
        validation.errors = [];
        todoAPI =
            createAPI(todoAPISpec)
            .validate(initialState)
            .mount(createStore(reducer, initialState, applyMiddleware(ReduxThunk)));
        expect(validation.errors.length).toBe(0);
    });
    it ("can add todos", () => {
        {
            const {addTodo} = todoAPI({}, component);
            addTodo("second");
        }
        {
            const {todos, filteredTodos} = todoAPI({}, component);
            expect(todos[1].text).toBe("second");
            expect(filteredTodos[1].text).toBe("second");
        }
    });
    it ("can complete todos", () => {
        {
            const {completeTodo} = todoAPI({id: 1}, component);
            completeTodo();
        }
        {
            const {filteredTodos} = todoAPI({}, component);
            expect(filteredTodos.length).toBe(1);
        }
    });
    it ("can edit todos", () => {
        {
            const {editTodo} = todoAPI({id: 1}, component);
            editTodo("edited");
        }
        {
            const {todos, todo} = todoAPI({id: 1}, component);
            expect(todo.text).toBe("edited");
            expect(todos[1].text).toBe("edited");
        }
    });
    it ("can delete todo by making text blank", () => {
        {
            const {updateTodo} = todoAPI({id: 1}, component);
            updateTodo("");
        }
        {
            const {todos, todo} = todoAPI({}, component);
            expect(todos.length).toBe(1);
        }
    });
    it ("can complete all todos", () => {
        {
            const {completeAllTodos} = todoAPI({}, component);
            completeAllTodos();
        }
        {
            const {filteredTodos, todos} = todoAPI({}, component);
            expect(filteredTodos.length).toBe(0);
            expect(todos.length).toBe(1);
        }
    });
    it ("can uncomplete all todos", () => {
        {
            const {completeAllTodos} = todoAPI({}, component);
            completeAllTodos();
        }
        {
            const {filteredTodos, todos} = todoAPI({}, component);
            expect(filteredTodos.length).toBe(1);
            expect(todos.length).toBe(1);
        }
    });
    it ("can change filter", () => {
        {
            const {setFilter} = todoAPI({}, component);
            setFilter(SHOW_COMPLETED);
        }
        {
            const {filteredTodos} = todoAPI({}, component);
            expect(filteredTodos.length).toBe(0);
        }
    });
    it ("can clear completed", () => {
        {
            const {completeAllTodos, clearCompleted} = todoAPI({}, component);
            completeAllTodos();
            clearCompleted();
        }
        {
            const {todos} = todoAPI({}, component);
            expect(todos.length).toBe(0);
        }
    });
})
