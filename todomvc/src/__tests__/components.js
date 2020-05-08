import React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import App from '../components/App'
import Header from '../components/Header'
import Footer from "../components/Footer";
import MainSection from '../components/MainSection'
import Link from "../components/Link";
import {todoAPI} from "../capi";
import {SHOW_COMPLETED} from "../capi/TodoFilters";
import TodoItem from "../components/TodoItem";

// Because this is a demo of redux-capi only the tests relevant to demonstrating how to test the component's interface
// with it's API are shown by using the mock capability of redux-capi. Only components that use redux-capi are included

const renderer = createRenderer()

describe('Footer', () => {

  afterEach(() => {todoAPI.unmock();}),

  it('should render active and completed count', () => {
    // Mock feeds api values to a component to be rendered
    todoAPI.mock({activeCount: 1, completedCount: 1, visibilityFilter: SHOW_COMPLETED})
    const [span, ul, button] = render(<Footer />).props.children
    expect(getTextContent(span)).toBe("1 item left");
    expect(!!ul.props.children[0].props.children.props.active).toBe(false);
    expect(!!ul.props.children[1].props.children.props.active).toBe(false);
    expect(!!ul.props.children[2].props.children.props.active).toBe(true);
    todoAPI.unmock()
  })

  it('should not display clear when no completed items', () => {
    todoAPI.mock({activeCount: 1, completedCount: 0, visibilityFilter: SHOW_COMPLETED})
    const [,, button] = render(<Footer />).props.children
    expect(button).toBe(false);
  })

  it('should clear completed items', () => {
    const mock = todoAPI.mock({activeCount: 1, completedCount: 1, visibilityFilter: SHOW_COMPLETED})
    const [,, button] = render(<Footer />).props.children
    button.props.onClick();
    // mock is populated with properties for each action/thunk so you can see if it was invoked
    expect(mock.clearCompleted.calls.length).toBe(1);
  })

})

describe("Header", () => {

  afterEach(() => {todoAPI.unmock();})

  it("should add a todo", () => {
    const mock = todoAPI.mock({})
    const [h1, input] = render(<Header />).props.children;
    input.props.onSave('todo');
    expect(mock.addTodo.calls[0][0]).toBe('todo');
  });

});

describe("Link", () => {

  afterEach(() => {todoAPI.unmock();})

  it("should add a todo", () => {
    const mock = todoAPI.mock({})
    const link = render(<Link active children="" filter='x' />);
    link.props.onClick();
    expect(mock.setFilter.calls[0][0]).toBe('x');
  });

});

describe("MainSection", () => {

  afterEach(() => {todoAPI.unmock();})

  it("should handle empty list", () => {
    const mock = todoAPI.mock({completedCount: 0, todosCount: 0, filteredTodos: []})
    const [span, ul, footer] = render(<MainSection />).props.children;
    expect(span).toBe(false);
    expect(ul.props.children.length).toBe(0);
    expect(footer).toBe(false);
  });

  it("should handle todo items", () => {
    const mock = todoAPI.mock({completedCount: 1, todosCount: 1, filteredTodos: [{id: 1, text: "foo", completed: true}]})
    const [span, ul, footer] = render(<MainSection />).props.children;
    const [input, label] = span.props.children;
    expect(input.props.checked).toBe(true);
    label.props.onClick();
    expect(mock.completeAllTodos.calls.length).toBe(1);
    expect(ul.props.children[0].props.id).toBe(1);
    expect(footer.type).toBe(Footer);
  });
});
describe("TodoItem", () => {

  afterEach(() => {todoAPI.unmock();})

  it("should handle empty list", () => {

    const mock = todoAPI.mock({todo: {id: 1, text: "foo", completed: true}});

    renderer.render(<TodoItem />)

    const div = renderer.getRenderOutput().props.children;
    const [input, label, button] = div.props.children;

    button.props.onClick();
    input.props.onChange();

    expect(mock.deleteTodo.calls.length).toBe(1);
    expect(mock.completeTodo.calls.length).toBe(1);
    expect(getTextContent(label)).toBe("foo")

    label.props.onDoubleClick();
    const TodoTextInput = renderer.getRenderOutput().props.children;
    expect(TodoTextInput.props.text).toBe("foo");

    TodoTextInput.props.onSave("bar");
    expect(mock.updateTodo.calls[0][0]).toBe("bar");

  });
});

const getTextContent = elem => {
  const children = Array.isArray(elem.props.children) ?
      elem.props.children : [ elem.props.children ]

  return children.reduce((out, child) =>
      out + (child.props ? getTextContent(child) : child)
      , '')
}
function render(jsx) {
  renderer.render(jsx)
  return renderer.getRenderOutput();
}

