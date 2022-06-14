import { IAugmentedJQuery, IComponentOptions } from 'angular';
import NgComponent from 'ngcomponent';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';

const defaultBinding = '<';

const selector = '$element';

type Bindings<K> = Record<keyof K, '<'>;

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
    bindingNames: (keyof Props)[] | null = null,
    injectNames: string[] = [],
): IComponentOptions {
    const names = bindingNames || (Class.propTypes && (Object.keys(Class.propTypes) as (keyof Props)[])) || [];

    const bindings = names.reduce<Bindings<Props>>((acc, curr) => {
        acc[curr] = defaultBinding;
        return acc;
    }, {} as Bindings<Props>);

    return {
        bindings,
        controller: [
            selector,
            ...injectNames,
            class extends NgComponent<Props> {
                static get $$ngIsClass() {
                    return true;
                }
                isDestroyed = false;
                injectedProps: { [name: string]: unknown };
                root?: Root;
                constructor(private $element: IAugmentedJQuery, ...injectedProps: unknown[]) {
                    super();
                    this.injectedProps = {};
                    injectNames.forEach((name, i) => {
                        this.injectedProps[name] = injectedProps[i];
                    });
                    this.root = createRoot(this.$element[0]);
                }
                render() {
                    if (!this.isDestroyed && this.root) {
                        this.root.render(
                            <React.StrictMode>
                                <Class {...(this.props as Props)} {...this.injectedProps} />
                            </React.StrictMode>,
                        );
                    }
                }
                componentWillUnmount() {
                    this.isDestroyed = true;
                    if (this.root) {
                        this.root.unmount();
                    }
                }
            },
        ],
    };
}
