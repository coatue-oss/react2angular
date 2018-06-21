# Changelog

### 4.0.4

- [patch] Use TypeScript Strict mode 4447c1967a77ffba8d3d6a6c419a5a8b47844d17
- [patch] Run lint as part of build aa055943951019330040bada87fd16b4d3e86ca4
- [patch] Upgrade `devDependencies` aee4487ea896ee5d92bbd60df14efea3345e2bbb

### 4.0.3

- [patch] Add changelog

### 4.0.2

- [patch] Move *@types/angular* from `dependencies` to `devDependencies` fc6fe7c4e64cc0fc654082f74ee21c27cc5d43ff

## 4.0.1

- [major] Switch prop precedence: dependency injected props now override regular props 5bc181040747ab34ada436cce2ed89d9e3e257eb
- [minor] Add `$$ngIsClass` class accessor to support older browsers f361ac5b905e74070c870a2b4f86321048b7a02e

### 3.2.1

- [patch] Upgrade `devDependencies` b307f1b575cf37f898146d4a47eb6b9d0c7112a8

### 3.2.0

- [patch] Fix typo in docs 5fc50367b860e8374b660c052adc0861f20abb35
- [patch] Upgrade `devDependencies` 0549878a8afb50d910c0ecc359e9374ad9fd48d0 b5afa3bb8be3cd6e2da46b6c72d31a44dd17077b 5f167cd712b371ac32077c76769dee847041bc5d

### 3.1.0

- [minor] Add new dependency injection argument for easier interop with Angular 1 DI without having to use [ngimport](https://github.com/bcherny/ngimport) https://github.com/coatue-oss/react2angular/pull/49
- [patch] Document new dependency injection argument a4a68c23e64bc2d91a7ffdbc8bc637fb30e62920
- [patch] Clean up test d95d61291bfebd805025e63eee42ab86e3ae8fbd

### 3.0.2

- [patch] Upgrade dependencies cf65d0dd0531ff3dcded0d536639a066ca190b64

## 3.0.0

- [major] Upgrade *ngcomponent* dependency 47ff21f9229d2e3acbb14e96b7fc4cd0207d92c3
- [patch] Update minimum supported Angular version a870a8d5d9f4c7f79560708d57419187cd5f661d

## 2.0.0

- [major] Move *react* and *react-dom* from `dependencies` to `peerDependencies` d8a6d4ab80d6ea339e9934fe4bef477f10526c71
- [minor] Add *prop-types* peer dependency 791681b612117aaa64fe50fcfbe873f4c47ac482

### 1.1.3

- [patch] Use *lodash.frompairs* instead of requiring all of *lodash*

### 1.1.2

- [patch] Upgrade *ngcomponent* (this should have been a major bump)
