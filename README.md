# angularize [![Build Status](https://img.shields.io/circleci/project/bcherny/angularize.svg?branch=master&style=flat-square)](https://circleci.com/gh/bcherny/angularize) [![NPM](https://img.shields.io/npm/v/angularize.svg?style=flat-square)](https://www.npmjs.com/package/angularize) [![MIT](https://img.shields.io/npm/l/angularize.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> Description

## Installation

```sh
npm install angularize --save
```

## Usage

### 1. Create your React component

```jsx
interface Props {
  fooBar: number
  baz: string
}

class MyComponent extends React.Component<Props, void> {
  render() {
    return <div>
      <p>Foo: {this.props.fooBar}</p>
      <p>Bar: {this.props.bar}</p>
    </div>
  }
}
```

### 2. Expose it to Angular

```jsx
import { angularize } from 'angularize'

angular
  .module('myModule', [])
  .component('myComponent', angularize(MyComponent, ['foo', 'bar']))
```

### 3. Use it in your Angular 1 template

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