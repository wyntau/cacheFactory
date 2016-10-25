'use strict';

describe('cacheFactory', function() {

  it('should be exist', function() {
    expect(cacheFactory).to.exist;
  });


  it('should return a new cache whenever called', function() {
    var cache1 = cacheFactory('cache1');
    var cache2 = cacheFactory('cache2');
    expect(cache1).to.not.equal(cache2);

    cache1.destroy();
    cache2.destroy();
  });


  it('should complain if the cache id is being reused', function() {
    var cache1 = cacheFactory('cache1');
    expect(function() { return cacheFactory('cache1'); }).to.throw(/cache1 is already taken/);

    cache1.destroy();
  });


  describe('info', function() {

    it('should provide info about all created caches', function() {
      expect(cacheFactory.info()).to.deep.equal({});

      var cache1 = cacheFactory('cache1');
      expect(cacheFactory.info()).to.deep.equal({cache1: {id: 'cache1', size: 0}});

      cache1.put('foo', 'bar');
      expect(cacheFactory.info()).to.deep.equal({cache1: {id: 'cache1', size: 1}});

      cache1.destroy();
    });
  });


  describe('get', function() {

    it('should return a cache if looked up by id', function() {
      var cache1 = cacheFactory('cache1'),
          cache2 = cacheFactory('cache2');

      expect(cache1).to.not.equal(cache2);
      expect(cache1).to.equal(cacheFactory.get('cache1'));
      expect(cache2).to.equal(cacheFactory.get('cache2'));

      cache1.destroy();
      cache2.destroy();
    });
  });

  describe('cache', function() {
    var cache;

    beforeEach(function() {
      cache = cacheFactory('test');
    });

    afterEach(function(){
      cache.destroy();
    });


    describe('put, get & remove', function() {

      it('should add cache entries via add and retrieve them via get', function() {
        cache.put('key1', 'bar');
        cache.put('key2', {bar:'baz'});

        expect(cache.get('key2')).to.deep.equal({bar:'baz'});
        expect(cache.get('key1')).to.equal('bar');
      });


      it('should ignore put if the value is undefined', function() {
        cache.put();
        cache.put('key1');
        cache.put('key2', undefined);

        expect(cache.info().size).to.equal(0);
      });


      it('should remove entries via remove', function() {
        cache.put('k1', 'foo');
        cache.put('k2', 'bar');

        cache.remove('k2');

        expect(cache.get('k1')).to.equal('foo');
        expect(cache.get('k2')).to.be.undefined;

        cache.remove('k1');

        expect(cache.get('k1')).to.be.undefined;
        expect(cache.get('k2')).to.be.undefined;
      });


      it('should return undefined when entry does not exist', function() {
        expect(cache.remove('non-existent')).to.be.undefined;
      });


      it('should stringify keys', function() {
        cache.put('123', 'foo');
        cache.put(123, 'bar');

        expect(cache.get('123')).to.equal('bar');
        expect(cache.info().size).to.equal(1);

        cache.remove(123);
        expect(cache.info().size).to.equal(0);
      });


      it('should return value from put', function() {
        var obj = {};
        expect(cache.put('k1', obj)).to.deep.equal(obj);
      });
    });


    describe('info', function() {

      it('should size increment with put and decrement with remove', function() {
        expect(cache.info().size).to.equal(0);

        cache.put('foo', 'bar');
        expect(cache.info().size).to.equal(1);

        cache.put('baz', 'boo');
        expect(cache.info().size).to.equal(2);

        cache.remove('baz');
        expect(cache.info().size).to.equal(1);

        cache.remove('foo');
        expect(cache.info().size).to.equal(0);
      });

      it('should only decrement size when an element is actually removed via remove', function() {
        cache.put('foo', 'bar');
        expect(cache.info().size).to.equal(1);

        cache.remove('undefined');
        expect(cache.info().size).to.equal(1);

        cache.remove('hasOwnProperty');
        expect(cache.info().size).to.equal(1);

        cache.remove('foo');
        expect(cache.info().size).to.equal(0);
      });

      it('should return cache id', function() {
        expect(cache.info().id).to.equal('test');
      });
    });


    describe('removeAll', function() {

      it('should blow away all data', function() {
        cache.put('id1', 1);
        cache.put('id2', 2);
        cache.put('id3', 3);
        expect(cache.info().size).to.equal(3);

        cache.removeAll();

        expect(cache.info().size).to.equal(0);
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.be.undefined;
        expect(cache.get('id3')).to.be.undefined;
      });
    });


    describe('destroy', function() {

      it('should make the cache unusable and remove references to it from cacheFactory', function() {
        cache.put('foo', 'bar');
        cache.destroy();

        expect(function() { cache.get('foo'); }).to.throw();
        expect(function() { cache.get('neverexisted'); }).to.throw();
        expect(function() { cache.put('foo', 'bar'); }).to.throw();

        expect(cacheFactory.get('test')).to.be.undefined;
        expect(cacheFactory.info()).to.deep.equal({});
      });
    });
  });


  describe('LRU cache', function() {

    it('should create cache with defined capacity', function() {
      var cache = cacheFactory('cache1', {capacity: 5});
      expect(cache.info().size).to.equal(0);

      for (var i = 0; i < 5; i++) {
        cache.put('id' + i, i);
      }

      expect(cache.info().size).to.equal(5);

      cache.put('id5', 5);
      expect(cache.info().size).to.equal(5);
      cache.put('id6', 6);
      expect(cache.info().size).to.equal(5);

      cache.destroy();
    });


    describe('eviction', function() {
      var cache;

      beforeEach(function() {
        cache = cacheFactory('cache1', {capacity: 2});

        cache.put('id0', 0);
        cache.put('id1', 1);
      });

      afterEach(function(){
        cache.destroy();
      });


      it('should kick out the first entry on put', function() {
        cache.put('id2', 2);
        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.equal(1);
        expect(cache.get('id2')).to.equal(2);
      });


      it('should refresh an entry via get', function() {
        cache.get('id0');
        cache.put('id2', 2);
        expect(cache.get('id0')).to.equal(0);
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.equal(2);
      });


      it('should refresh an entry via put', function() {
        cache.put('id0', '00');
        cache.put('id2', 2);
        expect(cache.get('id0')).to.equal('00');
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.equal(2);
      });


      it('should not purge an entry if another one was removed', function() {
        cache.remove('id1');
        cache.put('id2', 2);
        expect(cache.get('id0')).to.equal(0);
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.equal(2);
      });


      it('should purge the next entry if the stalest one was removed', function() {
        cache.remove('id0');
        cache.put('id2', 2);
        cache.put('id3', 3);
        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.equal(2);
        expect(cache.get('id3')).to.equal(3);
      });


      it('should correctly recreate the linked list if all cache entries were removed', function() {
        cache.remove('id0');
        cache.remove('id1');
        cache.put('id2', 2);
        cache.put('id3', 3);
        cache.put('id4', 4);
        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.be.undefined;
        expect(cache.get('id3')).to.equal(3);
        expect(cache.get('id4')).to.equal(4);
      });


      it('should blow away the entire cache via removeAll and start evicting when full', function() {
        cache.put('id0', 0);
        cache.put('id1', 1);
        cache.removeAll();

        cache.put('id2', 2);
        cache.put('id3', 3);
        cache.put('id4', 4);

        expect(cache.info().size).to.equal(2);
        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.be.undefined;
        expect(cache.get('id3')).to.equal(3);
        expect(cache.get('id4')).to.equal(4);
      });


      it('should correctly refresh and evict items if operations are chained', function() {
        cache = cacheFactory('cache2', {capacity: 3});

        cache.put('id0', 0); //0
        cache.put('id1', 1); //1,0
        cache.put('id2', 2); //2,1,0
        cache.get('id0');    //0,2,1
        cache.put('id3', 3); //3,0,2
        cache.put('id0', 9); //0,3,2
        cache.put('id4', 4); //4,0,3

        expect(cache.get('id3')).to.equal(3);
        expect(cache.get('id0')).to.equal(9);
        expect(cache.get('id4')).to.equal(4);

        cache.remove('id0'); //4,3
        cache.remove('id3'); //4
        cache.put('id5', 5); //5,4
        cache.put('id6', 6); //6,5,4
        cache.get('id4');    //4,6,5
        cache.put('id7', 7); //7,4,6

        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.be.undefined;
        expect(cache.get('id2')).to.be.undefined;
        expect(cache.get('id3')).to.be.undefined;
        expect(cache.get('id4')).to.equal(4);
        expect(cache.get('id5')).to.be.undefined;
        expect(cache.get('id6')).to.equal(6);
        expect(cache.get('id7')).to.equal(7);

        cache.removeAll();
        cache.put('id0', 0); //0
        cache.put('id1', 1); //1,0
        cache.put('id2', 2); //2,1,0
        cache.put('id3', 3); //3,2,1

        expect(cache.info().size).to.equal(3);
        expect(cache.get('id0')).to.be.undefined;
        expect(cache.get('id1')).to.equal(1);
        expect(cache.get('id2')).to.equal(2);
        expect(cache.get('id3')).to.equal(3);
      });
    });
  });
});