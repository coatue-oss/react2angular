import {
  bootstrap,
  element as $,
  IAugmentedJQuery,
  ICompileService,
  IComponentOptions, IController,
  IHttpService,
  IQService, IScope,
  module
} from 'angular'
import * as angular from 'angular'
import 'angular-mocks'
import { $http, $q, $rootScope } from 'ngimport'
import * as PropTypes from 'prop-types'
import * as React from 'react'
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

class TestSixService {
  constructor(private $q: IQService) { }

  foo() {
    return this.$q.resolve('testSixService result')
  }
}

type DIProps = {
  $element: IAugmentedJQuery
  $http: IHttpService
  testSixService: TestSixService
}

class TestSix extends React.Component<Props & DIProps> {
  state = {
    elementText: '',
    result: '',
    testSixService: ''
  }

  render() {
    return <div>
      <p>{this.state.result}</p>
      <p>{this.state.elementText}</p>
      <p>{this.state.testSixService}</p>
      <p>{this.props.foo}</p>
      <span>$element result</span>
    </div>
  }

  componentDidMount() {
    this.setState({
      elementText: this.props.$element.find('span').text()
    })
    this.props.$http.get('https://example.com/').then(_ =>
      this.setState({ result: _.data })
    )
    this.props.testSixService.foo().then(_ =>
      this.setState({ testSixService: _ })
    )
  }
}

function TestSeven(props: Props) {
  return <p>{props.foo}</p>
}

interface TestEightProps {
  onChange: jasmine.Spy,
  onComponentWillUnmount: jasmine.Spy,
  onRender: jasmine.Spy,
  values: string[],
}

class TestEight extends React.Component<TestEightProps> {
  render() {
    this.props.onRender()
    return this.props.values
      .map((value, index) => <div key={index}>{value}</div>)
  }

  componentWillUnmount() {
    this.props.onComponentWillUnmount()
    this.props.onChange(this.props.values
        .map(val => `${val}ss`))
  }
}

class TestEightWrapper implements IComponentOptions {
  bindings = {
    onComponentWillUnmount: '<',
    onRender: '<',
    values: '<'
  }
  template = `<test-angular-eight
                on-change="$ctrl.onChange"
                on-component-will-unmount="$ctrl.onComponentWillUnmount"
                on-render="$ctrl.onRender"
                values="$ctrl.values">
              </test-angular-eight>`
  controller = class implements IController {
    values!: string[]

    constructor(
      private $scope: IScope
    ){}

    onChange = (values: string[]) => {
      this.values = values
      this.$scope.$apply()
    }
  }
}

const TestAngularOne = react2angular(TestOne, ['foo', 'bar', 'baz'])
const TestAngularTwo = react2angular(TestTwo, ['foo', 'bar', 'baz'])
const TestAngularThree = react2angular(TestThree)
const TestAngularFour = react2angular(TestFour)
const TestAngularSix = react2angular(TestSix, ['foo'], ['$http', '$element', 'testSixService', 'foo'])
const TestAngularSeven = react2angular(TestSeven, null, ['foo'])
const TestAngularEight = react2angular(TestEight, ['values', 'onComponentWillUnmount', 'onRender', 'onChange'])

module('test', ['bcherny/ngimport'])
  .component('testAngularOne', TestAngularOne)
  .component('testAngularTwo', TestAngularTwo)
  .component('testAngularThree', TestAngularThree)
  .component('testAngularFour', TestAngularFour)
  .service('testSixService', ['$q', TestSixService])
  .constant('foo', 'CONSTANT FOO')
  .component('testAngularSix', TestAngularSix)
  .component('testAngularSeven', TestAngularSeven)
  .component('testAngularEight', TestAngularEight)
  .component('testAngularEightWrapper', new TestEightWrapper())

bootstrap($(), ['test'], { strictDi: true })

interface Props {
  bar: boolean[]
  baz(value: number): any
  foo: number
}

describe('react2angular', () => {

  let $compile: any

  beforeEach(() => {
    (angular as any).mock.module('test');
    (angular as any).mock.inject(function(_$compile_: ICompileService) {
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

    it('should use the injectNames for DI', () => {
      const defaultDi = (react2angular(TestThree).controller as any).slice(0, -1)
      const injectedDi = (react2angular(TestThree, null, ['foo', 'bar']).controller as any).slice(0, -1)
      expect(injectedDi).toEqual(defaultDi.concat(['foo', 'bar']))
    })

    it('should have default DI specifications if injectNames is empty', () => {
      const defaultDi = (react2angular(TestThree).controller as any).slice(0, -1)
      const injectedDi = (react2angular(TestThree, null, []).controller as any).slice(0, -1)
      expect(injectedDi).toEqual(defaultDi)
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

    it('should take injections, which override props', () => {
      spyOn($http, 'get').and.returnValue($q.resolve({ data: '$http response' }))
      const scope = Object.assign($rootScope.$new(true), {
        foo: 'FOO'
      })

      const element1 = $(`<test-angular-six foo="foo"></test-angular-six>`)
      $compile(element1)(scope)

      const element2 = $(`<test-angular-seven foo="foo"></test-angular-seven>`)
      $compile(element2)(scope)

      $rootScope.$apply()

      expect($http.get).toHaveBeenCalledWith('https://example.com/')
      expect(element1.find('p').eq(0).text()).toBe('$http response', '$http is injected')
      expect(element1.find('p').eq(1).text()).toBe('$element result', '$element is injected')
      expect(element1.find('p').eq(2).text()).toBe('testSixService result', 'testSixService is injected')
      expect(element1.find('p').eq(3).text()).toBe('CONSTANT FOO', 'injections should override props')
      expect(element2.find('p').text()).toBe('CONSTANT FOO', 'injections should override props')
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

    it('should not call render after component unmount', () => {
      const componentWillUnmountSpy = jasmine.createSpy('componentWillUnmount')
      const renderSpy = jasmine.createSpy('render')

      const scope = Object.assign($rootScope.$new(true), {
        onComponentWillUnmount: componentWillUnmountSpy,
        onRender: renderSpy,
        values: ['val1']
      })
      const element = $(`
        <test-angular-eight-wrapper
          on-render="onRender"
          on-component-will-unmount="onComponentWillUnmount"
          values="values">
        </test-angular-eight-wrapper>
      `)

      $compile(element)(scope)

      const childScope = angular
          .element(element.find('test-angular-eight'))
          .scope()
      $rootScope.$apply()

      // Erase first render caused on apply
      renderSpy.calls.reset()

      // Destroy child component to cause unmount
      childScope.$destroy()

      // Make sure render on child was not called after unmount
      expect(componentWillUnmountSpy.calls.count()).toEqual(1)
      expect(renderSpy.calls.count()).toEqual(0)
      expect(componentWillUnmountSpy).not.toHaveBeenCalledBefore(renderSpy)
    })
  })
})
