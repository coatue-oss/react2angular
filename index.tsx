import { IAugmentedJQuery, IComponentOptions } from 'angular'
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
    bindings: names.map(_ => [_, '<']).reduce((acc, pair) => {
      acc[pair[0]] = pair[1]
      return acc
    }, {} as any),
    controller: ['$element', class extends NgComponent<Props, void> {
      constructor(private $element: IAugmentedJQuery) {
        super()
      }
      render() {
        // TODO: rm any when https://github.com/Microsoft/TypeScript/pull/13288 is merged
        render(<Class {...(this.props as any)} />, this.$element[0])
      }
      componentWillUnmount() {
        unmountComponentAtNode(this.$element[0])
      }
    }]
  }
}
