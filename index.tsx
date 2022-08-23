import { IAugmentedJQuery, IComponentOptions } from 'angular'
import fromPairs from 'lodash-es/fromPairs'
import * as React from 'react'
import { ComponentType, ElementType, useEffect, useRef } from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import NgComponent from 'tlvince-ngcomponent'

/**
 * Appends DOM nodes to a `<div>`, tracking lifecycle.
 * To be used by R2AComponent only
 */
const R2AChildrenWrapper = ({ domChildren }: { domChildren: HTMLElement[] }) => {
  const childrenWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (childrenWrapperRef.current) {
      childrenWrapperRef.current.append(...domChildren)
    }

    return () => {
      if (childrenWrapperRef.current) {
        // TS Lint doesn't like replaceChildren()
        (childrenWrapperRef.current as any).replaceChildren()
      }
    }
  }, [domChildren, childrenWrapperRef.current])

  return <div ref={childrenWrapperRef} style={{ display: 'contents' }}></div>
}

/**
 * Renders a React component with existing DOM nodes as children.
 * The DOM nodes are injected into a child "R2AChildrenWrapper" component so that the original React component can control its display of child nodes transparently
 */
const R2AComponent = ({ domChildren, component, props }: { domChildren: HTMLElement[], component: ElementType, props: any}) => {
  const Component = component

  return (
    <Component {...props}>
      <R2AChildrenWrapper domChildren={domChildren} />
    </Component>
  )
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
  Class: ComponentType<Props>,
  bindingNames: (keyof Props)[] | null = null,
  injectNames: string[] = []
): IComponentOptions {
  const names = bindingNames
    || (Class.propTypes && Object.keys(Class.propTypes) as (keyof Props)[])
    || []
  return {
    bindings: fromPairs(names.map(_ => [_, '<'])),
    controller: ['$element', ...injectNames, class extends NgComponent<Props, any> {
      static get $$ngIsClass() {
        return true
      }
      isDestroyed = false
      injectedProps: { [name: string]: any }
      constructor(private $element: IAugmentedJQuery, ...injectedProps: any[]) {
        super()
        this.injectedProps = {}
        injectNames.forEach((name, i) => {
          this.injectedProps[name] = injectedProps[i]
        })
      }
      render() {
        if (!this.isDestroyed) {
          const domChildren = this.$element.children().toArray()
          render(
            <R2AComponent domChildren={domChildren} component={Class} props={{...this.props, ...this.injectedProps}} />,
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
