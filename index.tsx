import { IAugmentedJQuery, IComponentOptions } from 'angular'
import fromPairs = require('lodash.frompairs')
import NgComponent from 'ngcomponent'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

export type BindingNames = null | string[] | {
  [key: string]: any
}

type GenericObject = {
  [key: string]: any
}

/**
 * Wraps a React component in Angular. Returns a new Angular component.
 *
 * Usage:
 *
 *   ```ts
 *   type Props = { foo: number }
 *   class ReactComponent extends React.Component<Props, S> {}
 *   const AngularComponent = react2angular(ReactComponent, ['foo'])
 *   ```
 */
export function react2angular<Props>(
  Class: React.ComponentType<Props>,
  bindingNames: BindingNames = null,
  injectNames: string[] = []
): IComponentOptions {
  const bindingsList = bindingNames
    || (Class.propTypes && Object.keys(Class.propTypes) as (keyof Props)[])
    || []

  const bindings = Array.isArray(bindingsList) ? fromPairs(bindingsList.map(_ => [_, '<'])) : bindingsList

  return {
    bindings,
    controller: ['$element', ...injectNames, class extends NgComponent<Props> {
      static get $$ngIsClass() {
        return true
      }
      isDestroyed = false
      injectedProps: GenericObject
      constructor(private $element: IAugmentedJQuery, ...injectedProps: any[]) {
        super()
        this.injectedProps = {}
        injectNames.forEach((name, i) => {
          this.injectedProps[name] = injectedProps[i]
        })
      }
      render() {
        if (!this.isDestroyed) {
          const controller: GenericObject = this
          const props: { [key: string]: any } = Object.keys(bindings).reduce((
            props: GenericObject,
            key: string
          ) => {
            props[key] = controller[key]
            return props
          }, this.props)

          render(
            <Class {...props} {...this.injectedProps as any} />,
            this.$element[0]
          )
        }
      }
      componentWillUnmount() {
        this.isDestroyed = true
        unmountComponentAtNode(this.$element[0])
      }
    }]
  }
}
