import {
  IAugmentedJQuery,
  ICompileService,
  IComponentOptions,
  IScope,
  ITranscludeFunction
} from 'angular'
import HTMLtoJSX = require('htmltojsx')
import Parser = require('html-react-parser')
import fromPairs = require('lodash.frompairs')
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
  bindingNames: (keyof Props)[] | null = null,
  injectNames: string[] = []
): IComponentOptions {
  const names = bindingNames
    || (Class.propTypes && Object.keys(Class.propTypes))
    || []

  return {
    bindings: fromPairs(names.map(_ => [_, '<'])),
    controller: ['$element', '$transclude', '$compile', ...injectNames, class extends NgComponent<Props> {
      private transcludedContent: JQuery
      private transclusionScope: IScope

      injectedProps: { [name: string]: any }
      constructor(private $element: IAugmentedJQuery, private $transclude: ITranscludeFunction, private $compile: ICompileService, ...injectedProps: any[]) {
        super()
        this.injectedProps = {}
        injectNames.forEach((name, i) => {
          this.injectedProps[name] = injectedProps[i]
        })
      }
      render() {
        let children;
        this.$transclude((clone: JQuery, scope: IScope) => {
          const isDigestCycle = scope.$$phase || scope.$root.$$phase;

          children = Array.prototype.slice.call(this.transcludedContent || clone).map((element: HTMLElement) => {
            if (!isDigestCycle) {
              this.$compile(element)(scope)
              scope.$apply()
            }

            return converter.convert(element.outerHTML)
          })
          this.transcludedContent = clone
          this.transclusionScope = scope
        })

        render(
          <Class {...this.injectedProps} {...this.props}>
            {Parser(children && (children as string[]).join(''))}
          </Class>, this.$element[0])
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
