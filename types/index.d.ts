/// <reference types="jest-extended" />

import { IComponentOptions } from 'angular';

export type react2angular<T> = (props: {
    Class: React.ComponentType<T>;
    bindingNames: (keyof T)[] | null;
    injectNames?: string[];
}) => IComponentOptions;
