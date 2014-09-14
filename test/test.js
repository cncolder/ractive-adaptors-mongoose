var mongoose = require('mongoose');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var assert = chai.assert;

describe('ractive', function() {
  var schema = new mongoose.Schema({
    name: {
      first: String,
      last: String
    },
    age: {
      type: Number,
      min: 1
    }
  });
  schema.virtual('fullname')
    .get(function() {
      return this.name.first + ' ' + this.name.last;
    })
    .set(function(v) {
      var parts = v.split(' ');
      this.name.first = parts[0];
      this.name.last = parts[1];
    });

  var Test = Ractive.extend({
    el: '#ractive',
    template: '<div><span id="fullname">{{fullname}}</span> <span id="firstname">{{name.first}}</span> <span id="lastname">{{name.last}}</span> <span id="age">{{age}}</span> <span id="error">{{errors.age.message}}</span></div>',
    append: true,
    adapt: ['mongoose'],
  });

  describe('virtual', function() {
    it('should render fullname', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          name: {
            first: 'Jim',
            last: 'Green'
          }
        }, schema)
      });
      assert.equal(ractive.nodes.fullname.textContent, 'Jim Green');
    });

    it('should trigger name update after set fullname', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          name: {
            first: 'Jim',
            last: 'Green'
          }
        }, schema)
      });
      assert.equal(ractive.nodes.lastname.textContent, 'Green');
      ractive.set('fullname', 'Jim Black');
      assert.equal(ractive.nodes.lastname.textContent, 'Black');
    });

    it.skip('should trigger fullname update after set name', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          name: {
            first: 'Jim',
            last: 'Green'
          }
        }, schema)
      });
      ractive.set('name.last', 'Black');
      assert.equal(ractive.nodes.fullname.textContent, 'Jim Black');
    });
  });

  describe('validate', function() {
    it('should handle validate errors', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          age: -1
        }, schema)
      });
      assert.equal(ractive.nodes.error.textContent, '');
      return assert.isRejected(ractive.data.validate())
        .then(function() {
          assert.equal(ractive.nodes.error.textContent, 'Path `age` (-1) is less than minimum allowed value (1).');
        });
    });
  });

  describe('post set', function() {
    it('should trigger age update after modify age', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          age: 1
        }, schema)
      });
      assert.equal(ractive.nodes.age.textContent, '1');
      ractive.data.age = '2';
      assert.equal(ractive.nodes.age.textContent, '2');
    });
    
    it('should trigger name update after modify fullname', function() {
      var ractive = new Test({
        data: new mongoose.Document({
          name: {
            first: 'Jim',
            last: 'Green'
          }
        }, schema)
      });
      assert.equal(ractive.nodes.lastname.textContent, 'Green');
      ractive.data.fullname = 'Jim Black';
      assert.equal(ractive.nodes.lastname.textContent, 'Black');
    });
  });
});

describe('mocha', function() {
  it('should be ok', function() {
    assert.ok(true);
  });
});

describe('browserify', function() {
  it('should be browser', function() {
    assert(process.browser);
  });
});

// these tests for mongoose current behavior.
describe('mongoose', function() {
  describe('schema', function() {
    it('should create schema', function() {
      assert.instanceOf(new mongoose.Schema(), mongoose.Schema);
    });

    describe('timestamps', function() {
      var schema = new mongoose.Schema({}, {
        timestamps: true
      });

      it('should throw error now because pre save. 2014-9-13', function() {
        assert['throw'](function() {
          new mongoose.Document({}, schema);
        });
      });
    });

    describe('hooks', function() {
      describe('pre validate', function() {
        var schema = new mongoose.Schema({
          updatedAt: {
            type: Date
          }
        });
        schema.pre('validate', function(next) {
          this.updatedAt = Date.now();
          next();
        });

        it('should set updatedAt', function() {
          var doc = new mongoose.Document({}, schema);
          assert.isUndefined(doc.updatedAt);
          return doc.validate()
            .then(function() {
              assert.instanceOf(doc.updatedAt, Date);
            });
        });
      });

      describe('pre save', function() {
        var schema = new mongoose.Schema();
        schema.pre('save', function(next) {
          next();
        });

        it('should throw error now. 2014-9.13', function() {
          assert['throw'](function() {
            new mongoose.Document({}, schema);
          });
        });
      });
    });
  });

  describe('document', function() {
    var schema = new mongoose.Schema({
      name: String
    });

    it('should create document', function() {
      var doc = new mongoose.Document({}, schema);
      assert.instanceOf(doc, mongoose.Document);
    });

    it('should be an inited doc', function() {
      var doc = new mongoose.Document({}, schema);
      assert.isFalse(doc.isNew);
    });

    it('should have a default id', function() {
      var doc = new mongoose.Document({}, schema);
      assert.isString(doc.id);
      assert.lengthOf(doc.id, 24);
    });

    describe.skip('skipId', function() {
      it('should skip id', function() {
        var doc = new mongoose.Document({}, schema, null, true);
        assert.isUndefined(doc.id);
      });
    });

    describe('skipInit', function() {
      it('should skip init', function() {
        var doc = new mongoose.Document({}, schema, null, null, true);
        assert.isTrue(doc.isNew);
      });

      it('should lose data when skip init', function() {
        var doc = new mongoose.Document({
          name: 'abc'
        }, schema, null, null, true);
        assert.isUndefined(doc.name);
      });
    });

    describe('json', function() {
      it('should allow init unknown path', function() {
        var doc = new mongoose.Document({
          foo: 'bar'
        }, schema);
        assert.equal(doc.toJSON().foo, 'bar');
      });

      it('should does not allow set unknown path', function() {
        var doc = new mongoose.Document({}, schema);
        doc.foo = 'bar';
        assert.isUndefined(doc.toJSON().foo);
      });
    });

    describe('validate', function() {
      var schema = new mongoose.Schema({
        name: {
          type: String,
          required: true
        }
      });

      it.skip('should callback errors', function(done) {
        var doc = new mongoose.Document({}, schema);
        doc.validate(function(err) {
          assert.instanceOf(err, mongoose.Error.ValidatorError);
          done();
        });
      });

      it('should reject errors', function() {
        var doc = new mongoose.Document({}, schema);
        return assert.isRejected(doc.validate())
          .then(function(err) {
            assert.instanceOf(err, mongoose.Error.ValidationError);
          });
      });

      it('should not clear errors after validate success', function() {
        var doc = new mongoose.Document({}, schema);
        return assert.isRejected(doc.validate())
          .then(function() {
            doc.name = 'a';
            return assert.isFulfilled(doc.validate());
          })
          .then(function() {
            assert(doc.errors);
          });
      });

      it('should emit validate event', function(done) {
        var doc = new mongoose.Document({}, schema);
        doc.once('validate', function(doc) {
          assert(doc.errors);
          done();
        });
        doc.validate();
      });

      it('should emit validate event no matter success or failure', function(done) {
        var doc = new mongoose.Document({
          name: 'abc'
        }, schema);
        doc.once('validate', function(doc) {
          assert.notOk(doc.errors);
          done();
        });
        doc.validate();
      });
    });

    describe('virturl', function() {
      var schema = new mongoose.Schema({
        name: {
          first: String,
          last: String
        }
      });
      schema.virtual('fullname')
        .get(function() {
          return this.name.first + ' ' + this.name.last;
        })
        .set(function(v) {
          var parts = v.split(' ');
          this.name.first = parts[0];
          this.name.last = parts[1];
        });
      var doc = new mongoose.Document({
        name: {
          first: 'Jim',
          last: 'Green'
        }
      }, schema);

      it('should join first and last name', function() {
        assert.equal(doc.fullname, 'Jim Green');
      });

      it('should split to first and last name', function() {
        doc.fullname = 'Li Lei';
        assert.equal(doc.name.first, 'Li');
        assert.equal(doc.name.last, 'Lei');
      });
    });
  });
});
