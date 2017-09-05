import {
    IAugmentedJQuery,
    ICompileService,
    IComponentOptions,
    IScope,
    ITranscludeFunction
} from 'angular'
import fromPairs = require('lodash.frompairs')
import HTMLtoJSX = require('htmltojsx')
import Parser = require('html-react-parser')
import NgComponent from 'ngcomponent'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

const converter = new HTMLtoJSX({
  createClass: false
})

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
    controller: ['$element', '$transclude', '$compile', class extends NgComponent<Props, void> {
      private transcludedContent: JQuery
      private transclusionScope: IScope

      constructor(private $element: IAugmentedJQuery, private $transclude: ITranscludeFunction, private $compile: ICompileService) {
        super()
      }

      render() {
        let children
        this.$transclude((clone: JQuery, scope: IScope) => {
          children = Array.prototype.slice.call(clone).map((element: HTMLElement) => {
            this.$compile(element)(scope)
            const phase = scope.$root.$$phase
            if (phase !== '$apply' && phase !== '$digest') {
              scope.$apply()
            }
            return converter.convert(element.outerHTML)
          })
          this.transcludedContent = clone
          this.transclusionScope = scope
        })
        // TODO: rm any when https://github.com/Microsoft/TypeScript/pull/13288 is merged
        render(
          <Class {...(this.props as any)}>
            {Parser(children && (children as string[]).join(''))}
          </Class>,
          this.$element[0]
        )
      }

      componentWillUnmount() {
        unmountComponentAtNode(this.$element[0])
      }

      $onDestroy() {
        super.$onDestroy()
        this.transcludedContent.remove()
        this.transclusionScope.$destroy()
      }
    }],
    transclude: true
  }
}
