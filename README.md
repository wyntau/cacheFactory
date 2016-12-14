## cachefactory-ng [![NPM version](https://badge.fury.io/js/cachefactory-ng.png)](http://badge.fury.io/js/cachefactory-ng) [![Build Status](https://api.travis-ci.org/Treri/cacheFactory.svg)](https://travis-ci.org/Treri/cacheFactory) [![Dependencies Status](https://david-dm.org/Treri/cacheFactory.png)](https://david-dm.org/Treri/cacheFactory)

A stand alone cacheFactory split out from angular $cacheFactory. You can use it in any of your JavaScript applications, it doesn't have to be angular.js related.

### Install

```
npm install cachefactory-ng
```

### APIs
See angular.js [`$cacheFactory`](https://docs.angularjs.org/api/ng/type/$cacheFactory.Cache).

### Usage

```js
import cacheFactory from 'cachefactory-ng'

let cache = cacheFactory('cacheId');

cache.put('key', value);
```

### Related

- [`http-ng`](https://github.com/Treri/http-ng)

### License
MIT