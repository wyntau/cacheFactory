### cacheFactory

A stand alone cacheFactory split out from angular $cacheFactory. You can use it in any of your JavaScript applications, it doesn't have to be angular.js related.

### APIs
See angular.js [`$cacheFactory`](https://docs.angularjs.org/api/ng/type/$cacheFactory.Cache).

### Usage

```js

import {cacheFactory} from 'cachefactory';

const cache = cacheFactory('cacheId');

cache.put('key', value);
```

### License
MIT