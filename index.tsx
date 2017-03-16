import { IAugmentedJQuery, IComponentOptions } from 'angular'
import { fromPairs } from 'lodash'
import NgComponent from 'ngcomponent'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

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
  Class: React.ComponentClass<Props> | React.SFC<Props>,
  bindingNames?: (keyof Props)[]
): IComponentOptions {
  const names = bindingNames
    || (Class.propTypes && Object.keys(Class.propTypes))
    || []

  return {
    bindings: fromPairs(names.map(_ => [_, '<'])),
    controller: ['$element', class extends NgComponent<Props, void> {
      constructor(private $element: IAugmentedJQuery) {
        super()
      }
      render() {
        render(<Class {...this.props} />, this.$element[0])
      }
      componentWillUnmount() {
        unmountComponentAtNode(this.$element[0])
      }
    }]
  }
}
