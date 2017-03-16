import { bootstrap, element as $, ICompileService, mock, module } from 'angular'
import 'angular-mocks'
import { $rootScope } from 'ngimport'
import * as React from 'react'
import { Simulate } from 'react-addons-test-utils'
import { react2angular } from './'

class TestOne extends React.Component<Props, void> {
  render() {
    return <div>
      <p>Foo: {this.props.foo}</p>
      <p>Bar: {this.props.bar.join(',')}</p>
      <p onClick={() => this.props.baz(42)}>Baz</p>
      {this.props.children}
    </div>
  }
  componentWillUnmount() { }
}

const TestTwo: React.StatelessComponent<Props> = props =>
  <div>
    <p>Foo: {props.foo}</p>
    <p>Bar: {props.bar.join(',')}</p>
    <p onClick={() => props.baz(42)}>Baz</p>
    {props.children}
  </div>

class TestThreeWithPropTypes extends React.Component<Props, void> {
  static propTypes = {
    bar: React.PropTypes.array.isRequired,
    baz: React.PropTypes.func.isRequired,
    foo: React.PropTypes.number.isRequired
  }

  render() {
    return <div>
      <p>Foo: {this.props.foo}</p>
      <p>Bar: {this.props.bar.join(',')}</p>
      <p onClick={() => this.props.baz(42)}>Baz</p>
      {this.props.children}
    </div>
  }
  componentWillUnmount() { }
}

const TestAngularOne = react2angular(TestOne, ['foo', 'bar', 'baz'])
const TestAngularTwo = react2angular(TestTwo, ['foo', 'bar', 'baz'])

module('test', [])
  .component('testAngularOne', TestAngularOne)
  .component('testAngularTwo', TestAngularTwo)

bootstrap($(), ['test'], { strictDi: true })

interface Props {
  bar: boolean[]
  baz(value: number): any
  foo: number
}

describe('react2angular', () => {

  let $compile: any

  beforeEach(() => {
    mock.module('test')
    mock.inject(function (_$compile_: ICompileService) {
      $compile = _$compile_
    })
  })

  it('should give an angular component', () => {
    expect(TestAngularOne.bindings).not.toBe(undefined)
    expect(TestAngularOne.controller).not.toBe(undefined)
  })

  it('should use the propTypes when present and no bindingNames were specified', () => {
    const reactAngularComponent = react2angular(TestThreeWithPropTypes)

    expect(reactAngularComponent.bindings).toEqual({
      bar: '<',
      baz: '<',
      foo: '<'
    })
  })

  it('should use the bindingNames when present over the propTypes', () => {
    const reactAngularComponent = react2angular(TestThreeWithPropTypes, ['foo'])

    expect(reactAngularComponent.bindings).toEqual({
      foo: '<'
    })
  })

  it('should have empty bindings when parameter is an empty array', () => {
    const reactAngularComponent = react2angular(TestThreeWithPropTypes, [])

    expect(reactAngularComponent.bindings).toEqual({})
  })

  describe('react classes', () => {

    it('should render', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('p').length).toBe(3)
    })

    it('should update', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('p').eq(1).text()).toBe('Bar: true,false')
      scope.$apply(() =>
        scope.bar = [false, true, true]
      )
      expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true')
    })

    it('should destroy', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`)
      $compile(element)(scope)
      $rootScope.$apply()
      spyOn(TestOne.prototype, 'componentWillUnmount')
      scope.$destroy()
      expect(TestOne.prototype.componentWillUnmount).toHaveBeenCalled()
    })

    it('should take callbacks', () => {
      const baz = jasmine.createSpy('baz')
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz,
        foo: 1
      })
      const element = $(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`)
      $compile(element)(scope)
      $rootScope.$apply()
      Simulate.click(element.find('p').eq(2)[0])
      expect(baz).toHaveBeenCalledWith(42)
    })

    // TODO: support children
    it('should not support children', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-one foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-one>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('span').length).toBe(0)
    })

  })

  describe('react stateless components', () => {

    it('should render', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('p').length).toBe(3)
    })

    it('should update', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('p').eq(1).text()).toBe('Bar: true,false')
      scope.$apply(() =>
        scope.bar = [false, true, true]
      )
      expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true')
    })

    // TODO: figure out how to test this
    xit('should destroy', () => { })

    it('should take callbacks', () => {
      const baz = jasmine.createSpy('baz')
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz,
        foo: 1
      })
      const element = $(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`)
      $compile(element)(scope)
      $rootScope.$apply()
      Simulate.click(element.find('p').eq(2)[0])
      expect(baz).toHaveBeenCalledWith(42)
    })

    // TODO: support children
    it('should not support children', () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1
      })
      const element = $(`<test-angular-two foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-two>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.find('span').length).toBe(0)
    })

  })

})
