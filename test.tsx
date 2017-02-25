import * as React from 'react'
import { angularize } from './'

interface Props {
  foo: number
  bar: string
  baz: boolean[]
}

class Test extends React.Component<Props, void> {
  render() {
    return <div>
      <p>Foo: {this.props.foo}</p>
      <p>Bar: {this.props.bar}</p>
      <p>Baz: {this.props.baz.join(',')}</p>
    </div>
  }
}

const Test2: React.StatelessComponent<Props> = props =>
  <div>
    <p>Foo: {props.foo}</p>
    <p>Bar: {props.bar}</p>
    <p>Baz: {props.baz.join(',')}</p>
  </div>

const TestAngular = angularize(Test, ['foo', 'bar', 'baz'])
const Test2Angular = angularize(Test2, ['foo', 'bar', 'baz'])