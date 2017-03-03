<img alt="React to Angular: The easiest way to use React components in Angular 1" src="https://raw.githubusercontent.com/coatue/react2angular/master/logo.png" width="400px" />

# react2angular [![Build Status](https://img.shields.io/circleci/project/coatue/react2angular.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue/react2angular) [![NPM](https://img.shields.io/npm/v/react2angular.svg?style=flat-square)](https://www.npmjs.com/package/react2angular) [![Apache2](https://img.shields.io/npm/l/react2angular.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> The easiest way to embed React components in Angular 1 apps!

## Installation

```sh
npm install react2angular --save
```

## Usage

### 1. Create a React component

```jsx
import { Component } from 'react'

class MyComponent extends Component {
  render() {
    return <div>
      <p>FooBar: {this.props.fooBar}</p>
      <p>Baz: {this.props.baz}</p>
    </div>
  }
}
```

### 2. Expose it to Angular

```js
import { react2angular } from 'react2angular'

angular
  .module('myModule', [])
  .component('myComponent', react2angular(MyComponent, ['fooBar', 'baz']))
```

### 3. Use it in your Angular 1 code

```html
<my-component
  foo-bar="3"
  baz="'baz'"
></my-component>
```

## Tests

```sh
npm test
```

## License

Apache2
