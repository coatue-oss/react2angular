import { IAugmentedJQuery, IComponentOptions } from 'angular'
import fromPairs = require('lodash.frompairs')
import NgComponent from 'ngcomponent'
import * as React from 'react'
import * as PropTypes from 'prop-types'
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
  bindingNames: ({name: (keyof Props), optional:boolean}|(keyof Props))[] | null = null,
  injectNames: string[] = []
): IComponentOptions {
  const names: {name:string, optional:boolean}[] = (bindingNames && (bindingNames as any[]).map(_ => _.name?_:{name:_, optional: false}))
    || (Class.propTypes && Object.keys(Class.propTypes).map((_:keyof Props) => ({name: _, optional: !!((Class.propTypes as React.ValidationMap<Props>)[_] as PropTypes.Requireable<Props>).isRequired})))
    || []

  return {
    bindings: fromPairs(names.map(_ => [_.name, _.optional?'<?':'<'])),
    controller: ['$element', ...injectNames, class extends NgComponent<Props> {
      injectedProps: { [name: string]: any }
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
