export interface cacheFactoryInterface {
  (cacheId: string, options?: { capacity?: number; }): cacheObject;
  info?(): any;
  get?(cacheId: string): cacheObject;
}

export interface cacheObject {
  put<T>(key: string, value: T): T;
  get<T>(key: string): T;
  remove(key: string): void;
  removeAll(): void;
  destroy(): void;
  info(): {
    id: string,
    size: number
  };
}

// Pass in the objects to merge as arguments. For a deep extend, set the first
// argument to `true`.
function extend(...args: any[]): any {

  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // If deep merge and property is an object, merge properties
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (; i < length; i++) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

function createMap() {
  return Object.create(null);
}

const caches = {};

export let cacheFactory: cacheFactoryInterface = function (cacheId, options) {
  if (cacheId in caches) {
    throw new Error(`${cacheId} is already taken`);
  }

  var size = 0,
    stats = extend({}, options, { id: cacheId }),
    data = createMap(),
    capacity = (options && options.capacity) || Number.MAX_VALUE,
    lruHash = createMap(),
    freshEnd = null,
    staleEnd = null;

  return caches[cacheId] = {

    put: function (key, value) {
      if (value === undefined)
        return;
      if (capacity < Number.MAX_VALUE) {
        var lruEntry = lruHash[key] || (lruHash[key] = {
          key: key
        });

        refresh(lruEntry);
      }

      if (!(key in data))
        size++;
      data[key] = value;

      if (size > capacity) {
        this.remove(staleEnd.key);
      }

      return value;
    },

    get: function (key) {
      if (capacity < Number.MAX_VALUE) {
        var lruEntry = lruHash[key];

        if (!lruEntry)
          return;

        refresh(lruEntry);
      }

      return data[key];
    },

    remove: function (key) {
      if (capacity < Number.MAX_VALUE) {
        var lruEntry = lruHash[key];

        if (!lruEntry)
          return;

        if (lruEntry == freshEnd)
          freshEnd = lruEntry.p;
        if (lruEntry == staleEnd)
          staleEnd = lruEntry.n;
        link(lruEntry.n, lruEntry.p);

        delete lruHash[key];
      }

      if (!(key in data))
        return;

      delete data[key];
      size--;
    },

    removeAll: function () {
      data = createMap();
      size = 0;
      lruHash = createMap();
      freshEnd = staleEnd = null;
    },

    destroy: function () {
      data = null;
      stats = null;
      lruHash = null;
      delete caches[cacheId];
    },

    info: function () {
      return extend({}, stats, { size: size });
    }
  };

  /**
   * makes the `entry` the freshEnd of the LRU linked list
   */
  function refresh(entry) {
    if (entry != freshEnd) {
      if (!staleEnd) {
        staleEnd = entry;
      } else if (staleEnd == entry) {
        staleEnd = entry.n;
      }

      link(entry.n, entry.p);
      link(entry, freshEnd);
      freshEnd = entry;
      freshEnd.n = null;
    }
  }

  /**
   * bidirectionally links two entries of the LRU linked list
   */
  function link(nextEntry, prevEntry) {
    if (nextEntry != prevEntry) {
      if (nextEntry)
        nextEntry.p = prevEntry; //p stands for previous, 'prev' didn't minify
      if (prevEntry)
        prevEntry.n = nextEntry; //n stands for next, 'next' didn't minify
    }
  }
}

cacheFactory.info = function () {
  var info = {};
  Object
    .keys(caches)
    .forEach(function (cacheId) {
      info[cacheId] = caches[cacheId].info();
    });
  return info;
};

cacheFactory.get = function (cacheId) {
  return caches[cacheId];
};
