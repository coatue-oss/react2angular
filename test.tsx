import { bootstrap, element as $, ICompileService, mock, module } from 'angular'
import 'angular-mocks'
import { $rootScope } from 'ngimport'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Simulate } from 'react-dom/test-utils'
import { react2angular } from './'

class TestOne extends React.Component<Props> {
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

const TestThree: React.StatelessComponent = () =>
  <div>Foo</div>

class TestFour extends React.Component<Props> {
  render() {
    return <div>Foo</div>
  }
}

class TestFive extends React.Component<Props> {
  static propTypes = {
    bar: PropTypes.array.isRequired,
    baz: PropTypes.func.isRequired,
    foo: PropTypes.number.isRequired
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
const TestAngularThree = react2angular(TestThree)
const TestAngularFour = react2angular(TestFour)

module('test', ['bcherny/ngimport'])
  .component('testAngularOne', TestAngularOne)
  .component('testAngularTwo', TestAngularTwo)
  .component('testAngularThree', TestAngularThree)
  .component('testAngularFour', TestAngularFour)

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

  describe('initialization', () => {
    it('should give an angular component', () => {
      expect(TestAngularOne.bindings).not.toBe(undefined)
      expect(TestAngularOne.controller).not.toBe(undefined)
    })

    it('should use the propTypes when present and no bindingNames were specified', () => {
      const reactAngularComponent = react2angular(TestFive)

      expect(reactAngularComponent.bindings).toEqual({
        bar: '<',
        baz: '<',
        foo: '<'
      })
    })

    it('should use the bindingNames when present over the propTypes', () => {
      const reactAngularComponent = react2angular(TestFive, ['foo'])

      expect(reactAngularComponent.bindings).toEqual({
        foo: '<'
      })
    })

    it('should have empty bindings when parameter is an empty array', () => {
      const reactAngularComponent = react2angular(TestFive, [])
      expect(reactAngularComponent.bindings).toEqual({})
    })

    it('should have empty bindings when parameter is not passed', () => {
      expect(react2angular(TestThree).bindings).toEqual({})
    })
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

    it('should render (even if the component takes no props)', () => {
      const scope = $rootScope.$new(true)
      const element = $(`<test-angular-four></test-angular-four>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.text()).toBe('Foo')
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

    it('should render (even if the component takes no props)', () => {
      const scope = $rootScope.$new(true)
      const element = $(`<test-angular-three></test-angular-three>`)
      $compile(element)(scope)
      $rootScope.$apply()
      expect(element.text()).toBe('Foo')
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
