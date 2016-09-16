/*!
 * chai-withintoleranceof
 * Copyright(c) 2016 Rémi Tétreault <tetreault.remi@gmail.com>
 * MIT Licensed
 */


module.exports = function (chai, utils) {
  var Assertion = chai.Assertion;
  var flag = utils.flag;

  /**
   * ### .withinToleranceOf(expected, tol)
   *
   * Asserts that the target is within tolerance of an expected value.
   *     // check that 515 is within tolerance of 500 +/- 5% (475 .. 525)
   *     expect(515).to.be.withinToleranceOf(500, 0.05);
   *
   *     // check that 786 is within tolerance of
   *     // 1000 +30% / -70% (300 .. 1300)
   *     expect(786).to.be.withinToleranceOf(1000, [+0.3, -0.7]);
   *     expect(786).to.be.withinToleranceOf(1000, [-0.7, +0.3]);
   *
   *     // check that 400 is within tolerance of 350 +15% (350 .. 402.5)
   *     expect(400).to.be.withinToleranceOf(350, [+0.15]);
   *
   *     // check that 500 is within tolerance of 555 -37% (349.65 .. 555)
   *     expect(500).to.be.withinToleranceOf(555, [-0.37]);
   *
   *     // check that -645 is within tolerance of
   *     // -1000 +30% / -70% (-1300 .. -300)
   *     expect(-645).to.be.withinToleranceOf(-1000, [+0.3, -0.7]);
   *     expect(-645).to.be.withinToleranceOf(-1000, [-0.7, +0.3]);
   *
   * Can also be used in conjunction with `length` to
   * assert a length is within tolerance. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     // check that the length of 'foo' is within tolerance of
   *     // 2 +/- 50% (1 .. 3)
   *     expect('foo').to.have.length.withinToleranceOf(2, 0.5);
   *
   *     // check that the length of the array is within tolerance of
   *     // 2 +50% / -40% (1.2 .. 3)
   *     expect([ 1, 2, 3 ]).to.have.length.withinToleranceOf(2, [+0.5, -0.4]);
   *
   * @name withinToleranceOf
   * @param {Number} expected expected value
   * @param {(Number|Number[])} tol tolerance inclusive
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function withinToleranceOf (expected, tol, msg) {
    if (msg) flag(this, 'message', msg);
    if (utils.type(expected) !== 'number') {
      throw new Error('the argument expected of withinToleranceOf must '
          + 'be a number');
    }

    var obj = flag(this, 'object');
    var range, start, finish;

    switch (utils.type(tol)) {
      case 'number':
        tol = [tol, -tol];
        // continue to the next case

      case 'array':
        switch (tol.length) {
          case 0:
            tol = [0];
            // continue to the next case

          case 1:
            tol = tol.concat(0);
            // continue to the next case

          default:
            var a = tol[0], b = tol[1], tmp;

            // Make sure that the 2 values are numbers and that they do not
            // have the same sign
            if (utils.type(a) !== 'number' || utils.type(b) !== 'number' ||
                (a !== 0 && b !== 0 && a > 0 === b > 0)) {

              throw new Error('the argument tol of withinToleranceOf must be '
                  + 'an array with a positive and a negative number');
            }

            var tolPos = Math.abs(a), tolNeg = Math.abs(b);

            if (a < b) {
              tmp = tolPos;
              tolPos = tolNeg;
              tolNeg = tmp;
            }

            if (tolPos === tolNeg) {
              range = expected + ' +/- ' + tolPos*100 + '%';
            } else {
              range = expected + ' +' + tolPos*100 + '% / ' + '-'
                  + tolNeg*100 + '%';
            }


            start = -expected*tolNeg + expected;
            finish = expected*tolPos + expected;

            if (expected < 0) {
              tmp = start;
              start = finish;
              finish = tmp;
            }

        }
        break;

      default:
        throw new Error('the argument tol of withinToleranceOf must be a '
            + 'number or an array with a positive and a negative number');
    }


    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert( len >= start && len <= finish
                 , 'expected #{this} to have a length within tolerance of '
                     + range
                 , 'expected #{this} to not have a length within tolerance of '
                     + range
                 );
    } else {
      new Assertion(obj, msg).is.a('number');
      this.assert( obj >= start && obj <= finish
                 , 'expected #{this} to be within tolerance of ' + range
                 , 'expected #{this} to not be within tolerance of ' + range
                 );
    }
  }


  Assertion.addMethod('withinToleranceOf', withinToleranceOf);
  Assertion.addMethod('withinTolOf', withinToleranceOf);
};
