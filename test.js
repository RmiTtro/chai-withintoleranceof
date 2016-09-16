var chai = require('chai');
var expect  = chai.expect;
var random = require('lodash/random');

chai.use(require('./index'));


function errorMsg (target, expected, tolPos, tolNeg) {
  var base = "AssertionError: expected " + target
      + " to be within tolerance of " + expected;

  if (tolPos === tolNeg)
    return  base + " +/- " + tolPos*100 + "%";
  else
    return base + ' +' + tolPos*100 + '% / ' + '-' + tolNeg*100 + '%';
}


function testWithinToleranceOf(expected, tolArg, tolPos, tolNeg) {
  var start, finish;

  if (expected > 0) {
    start = expected - expected*tolNeg;
    finish = expected + expected*tolPos;
  } else {
    start = expected + expected*tolPos;
    finish = expected - expected*tolNeg;
  }

  var a = start - random(1, 1000, true);
  var b = finish + random(1, 1000, true);

  expect(random(start, finish, true)).to.be.withinToleranceOf(expected,
      tolArg);
  expect(start).to.be.withinToleranceOf(expected, tolArg);
  expect(finish).to.be.withinToleranceOf(expected, tolArg);
  expect(function () {
    expect(a).to.be.withinToleranceOf(expected, tolArg);
  }).to.throw(Error, errorMsg(a, expected, tolPos, tolNeg));
  expect(function () {
    expect(b).to.be.withinToleranceOf(expected, tolArg);
  }).to.throw(Error, errorMsg(b, expected, tolPos, tolNeg));

}



describe('expect(...).to.be.withinToleranceOf(...)', function() {
  it( 'should assert that the target is within tolerance of expected +/- tol% '
        + 'when tol is a number'
    , function() {
        function tests(expected, tol) {
          testWithinToleranceOf(expected, +tol, tol, tol);
          testWithinToleranceOf(expected, -tol, tol, tol);
        }

        tests(500, 0.05); // (475 .. 525)
        tests(-2200, 0.32); // (-2904 .. -1496)
      }
    );


  it( 'should assert that the target is within tolerance of expected +tolPos% '
        + 'when tol is [+tolPos], [+tolPos,0], [0,+tolPos]'
    , function() {
        function tests(expected, tolPos, tolNeg) {
          testWithinToleranceOf(expected, [+tolPos], tolPos, tolNeg);
          testWithinToleranceOf(expected, [+tolPos, 0], tolPos, tolNeg);
          testWithinToleranceOf(expected, [+tolPos, -0], tolPos, tolNeg);
          testWithinToleranceOf(expected, [0, +tolPos], tolPos, tolNeg);
          testWithinToleranceOf(expected, [-0, +tolPos], tolPos, tolNeg);
        }

        tests(350, 0.15, 0); // (350 .. 402.5)
        tests(-874, 0.215, 0); // (-1061.91 .. -874)
      }
    );


  it( 'should assert that the target is within tolerance of expected -tolNeg% '
        + 'when tol is [-tolNeg], [-tolNeg,0], [0,-tolNeg]'
    , function() {
        function tests(expected, tolPos, tolNeg) {
          testWithinToleranceOf(expected, [-tolNeg], tolPos, tolNeg);
          testWithinToleranceOf(expected, [-tolNeg,0], tolPos, tolNeg);
          testWithinToleranceOf(expected, [-tolNeg,-0], tolPos, tolNeg);
          testWithinToleranceOf(expected, [0,-tolNeg], tolPos, tolNeg);
          testWithinToleranceOf(expected, [-0,-tolNeg], tolPos, tolNeg);
        }

        tests(555, 0, 0.37); // (349.65 .. 555)
        tests(-452.471, 0, 0.113); // (-452.471 .. -401.341777)
      }
    );


  it( 'should assert that the target is equal to expected '
        + 'when tol is 0, [0], [0,0]'
    , function() {
        function tests(expected) {
          testWithinToleranceOf(expected, 0, 0, 0);
          testWithinToleranceOf(expected, -0, 0, 0);
          testWithinToleranceOf(expected, [0], 0, 0);
          testWithinToleranceOf(expected, [-0], 0, 0);
          testWithinToleranceOf(expected, [0, 0], 0, 0);
          testWithinToleranceOf(expected, [-0, -0], 0, 0);
          testWithinToleranceOf(expected, [0, -0], 0, 0);
          testWithinToleranceOf(expected, [-0, 0], 0, 0);
        }

        tests(4553.1847); // (4553.1847)
        tests(-74247.23); // (-74247.23)
      }
    );


  it( 'should assert that the target is within tolerance of '
        + 'expected +tolPos% / -tolNeg% when tol '
        + 'is [+tolPos,-tolNeg], [-tolNeg,+tolPos]'
    , function() {
        function tests(expected, tolPos, tolNeg) {
          testWithinToleranceOf(expected, [+tolPos, -tolNeg], tolPos, tolNeg);
          testWithinToleranceOf(expected, [-tolNeg, +tolPos], tolPos, tolNeg);
        }

        tests(1000, 0.3, 0.7); // (300 .. 1300)
        tests(-656.26, 0.023, 0.1432) // (-671.35398 .. -562.283568)
      }
    );


  it('should assert that the target is 0 when expected is 0', function() {
    testWithinToleranceOf(0, 0.541, 0.541, 0.541);
    testWithinToleranceOf(0, [+0.146, -0.0745], 0.146, 0.0745);
    testWithinToleranceOf(0, 0, 0, 0);
  });


  it( 'should only use the first 2 values when tol is an array of more '
        + 'than 2 values'
    , function() {
        function tests(expected, tolPos, tolNeg) {
          testWithinToleranceOf(expected,
              [+tolPos, -tolNeg, 41, "ahsdjbf", {}, 14], tolPos, tolNeg);
          testWithinToleranceOf(expected,
              [-tolNeg, +tolPos, 23, 47, "dsd", {a: 1}], tolPos, tolNeg);
        }

        tests(1000, 0.3, 0.7); // (300 .. 1300)
      }
    );


  it( 'should throw an error when tol is an array of 2 values '
        + 'with the same sign'
    , function() {
        expect(function () {
          expect(457).to.be.withinToleranceOf(430, [0.2, 0.3]);
        }).to.throw();

        expect(function () {
          expect(780).to.be.withinToleranceOf(770, [-0.14, -0.22]);
        }).to.throw();
      }
    );


  it( 'should throw an error when tol is not a number or an array of numbers'
    , function() {
        expect(function () {
          expect(457).to.be.withinToleranceOf(430, '0.12');
        }).to.throw();

        expect(function () {
          expect(457).to.be.withinToleranceOf(430);
        }).to.throw();

        expect(function () {
          expect(780).to.be.withinToleranceOf(770, [0.24, '-0.14']);
        }).to.throw();
      }
    );


  it( 'should throw an error when expected is not a number'
    , function() {
        expect(function () {
          expect(457).to.be.withinToleranceOf('430', 0.12);
        }).to.throw();

        expect(function () {
          expect(457).to.be.withinToleranceOf(null, 0.12);
        }).to.throw();
      }
    );


  it( 'should throw an error when target is not a number'
    , function() {
        expect(function () {
          expect('457').to.be.withinToleranceOf(430, 0.12);
        }).to.throw();

        expect(function () {
          expect({}).to.be.withinToleranceOf(74165, 0.054);
        }).to.throw();

        expect(function () {
          expect(null).to.be.withinToleranceOf(6849, 0.0713);
        }).to.throw();
      }
    );


  it( 'should be possible to use it in conjunction with `length`'
    , function() {
        expect('foo').to.have.length.withinToleranceOf(2, 0.5); // (1 .. 3)
        expect([1, 2, 3]).to.have.length.withinToleranceOf(2, [+0.5, -0.4]);
                                                           // (1.2 .. 3)

        expect(function () {
          expect([1, 2, 3, 4]).to.have.length.withinToleranceOf(2,
              [+0.5, -0.4]);
        }).to.throw();
      }
    );


  it('should be possible to use the abbreviated form', function() {
    expect(-645).to.be.withinTolOf(-1000, [+0.3, -0.7]);
  });

});
