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
 *   const AngularComponent = angularize(ReactComponent, ['foo'])
 *   ```
 */
export function angularize<Props>(
  Class: React.ComponentClass<Props> | React.SFC<Props>,
  bindingNames: (keyof Props)[]
): IComponentOptions {
  return {
    bindings: fromPairs(bindingNames.map(_ => [_, '<'])),
    controller: class extends NgComponent<Props, void> {
      constructor(private $element: IAugmentedJQuery) {
        super()
      }
      render() {
        render(<Class {...this.props} />, this.$element[0])
      }
      componentWillUnmount() {
        unmountComponentAtNode(this.$element[0])
      }
    }
  }
}
