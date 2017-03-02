# react2angular [![Build Status](https://img.shields.io/circleci/project/coatue/react2angular.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue/react2angular) [![NPM](https://img.shields.io/npm/v/react2angular.svg?style=flat-square)](https://www.npmjs.com/package/react2angular) [![Apache2](https://img.shields.io/npm/l/react2angular.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> The easiest way to use React components in Angular 1!

## Installation

```sh
npm install react2angular --save
```

## Usage

### 1. Create a React component

```jsx
import { Component } from 'react'

interface Props {
  fooBar: number
  baz: string
}

interface State {...}

class MyComponent extends Component<Props, State> {
  render() {
    return <div>
      <p>Foo: {this.props.fooBar}</p>
      <p>Bar: {this.props.bar}</p>
    </div>
  }
  ...
}
```

*Note: this example uses TypeScript, but it works just as well with vanilla JavaScript, ES6, Flow, etc.*

### 2. Expose it to Angular

```jsx
import { react2angular } from 'react2angular'

angular
  .module('myModule', [])
  .component('myComponent', react2angular(MyComponent, ['foo', 'bar']))
```

### 3. Use it in your Angular 1 code

```html
<my-component
  foo-bar="3"
  baz="'foo'"
></my-component>
```

## Tests

```sh
npm test
```

## License

Apache2
