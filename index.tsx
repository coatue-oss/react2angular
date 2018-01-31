import { IAugmentedJQuery, IComponentOptions } from 'angular'
import fromPairs = require('lodash.frompairs')
import mapValues = require('lodash.mapvalues')
import NgComponent from 'ngcomponent'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

export type BindingNames<Props> = (keyof Props)[]
  | { [K in keyof Props]: { optional: boolean } }

type AngularBindings<Props> = {
  [K in keyof Props]: '<' | '<?'
}

/**
 * Wraps a React component in Angular. Returns a new Angular component.
 *
 * Usage:
 *
 *   ```ts
 *   type Props = { foo: number }
 *   class ReactComponent extends React.Component<Props> {}
 *   let AngularComponent = react2angular(ReactComponent, ['foo'])
 *   ```
 */
export function react2angular<Props>(
  Class: React.ComponentType<Props>,
  bindingNames: BindingNames<Props> | null = null,
  injectNames: string[] = []
): IComponentOptions {
  return {
    bindings: normalizeBindingNames(bindingNames, Class),
    controller: ['$element', ...injectNames, class extends NgComponent<Props> {
      injectedProps: { [name: string]: any } // TODO
      constructor(private $element: IAugmentedJQuery, ...injectedProps: any[]) {
        super()
        this.injectedProps = {}
        injectNames.forEach((name, i) => {
          this.injectedProps[name] = injectedProps[i]
        })
      }
      render() {
        // TODO: rm any when https://github.com/Microsoft/TypeScript/pull/13288 is merged
        render(<Class {...this.injectedProps} {...(this.props as any)} />, this.$element[0])
      }
      componentWillUnmount() {
        unmountComponentAtNode(this.$element[0])
      }
    }]
  }
}

function normalizeBindingNames<Props>(
  bindingNames: BindingNames<Props> | null,
  Class: React.ComponentType<Props>
): AngularBindings<Props> {
  if (Array.isArray(bindingNames)) {
    return fromPairs(bindingNames.map(_ => [_, '<'])) as AngularBindings<Props>
  }
  if (bindingNames) {
    return mapValues(bindingNames, (_) => _.optional ? '<?' : '<') as AngularBindings<Props>
  }
  if (Class.propTypes) {
    return mapValues(Class.propTypes as {[K in keyof Props]:PropTypes.Requireable<any>}, (_:PropTypes.Requireable<any>) => !_.isRequired ? '<' : '<?') as AngularBindings<Props>
  }
  return {} as any // TODO
}
