/// <reference types="jest-extended" />

import { IComponentOptions } from 'angular';

export type WrapperFunction<T> = (props: {
    Class: React.ComponentType<T>;
    bindingNames: (keyof T)[] | null;
    injectNames?: string[];
}) => IComponentOptions;
