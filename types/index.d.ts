import { IComponentOptions } from 'angular';

type WrapperFunction<T> = (props: {
    Class: React.ComponentType<T>;
    bindingNames: (keyof T)[] | null;
    injectNames?: string[];
}) => IComponentOptions;
