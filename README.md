### cacheFactory

A stand alone cacheFactory split out from angular $cacheFactory. You can use it in any of your JavaScript applications, it doesn't have to be angular.js related.

### Install

```
npm install cachefactory-ng
```

### APIs
See angular.js [`$cacheFactory`](https://docs.angularjs.org/api/ng/type/$cacheFactory.Cache).

### Usage

```js

var cacheFactory = require('cachefactory-ng');

var cache = cacheFactory('cacheId');

cache.put('key', value);
```

### License
MIT