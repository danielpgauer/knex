'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(
  _possibleConstructorReturn2
);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _transaction = require('../../transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodash = require('lodash');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var debug = (0, _debug2.default)('knex:tx');

var Transaction_MySQL = (function(_Transaction) {
  (0, _inherits3.default)(Transaction_MySQL, _Transaction);

  function Transaction_MySQL() {
    (0, _classCallCheck3.default)(this, Transaction_MySQL);
    return (0, _possibleConstructorReturn3.default)(
      this,
      _Transaction.apply(this, arguments)
    );
  }

  return Transaction_MySQL;
})(_transaction2.default);

(0, _lodash.assign)(Transaction_MySQL.prototype, {
  query: function query(conn, sql, status, value) {
    var _this2 = this;

    var t = this;
    var q = this.trxClient
      .query(conn, sql)
      .catch(
        function(err) {
          return err.errno === 1305;
        },
        function() {
          _this2.trxClient.logger.warn(
            'Transaction was implicitly committed, do not mix transactions and ' +
              'DDL with MySQL (#805)'
          );
        }
      )
      .catch(function(err) {
        status = 2;
        value = err;
        t._completed = true;
        debug('%s error running transaction query', t.txid);
      })
      .tap(function() {
        if (status === 1) t._resolver(value);
        if (status === 2) {
          if ((0, _lodash.isUndefined)(value)) {
            value = new Error('Transaction rejected with non-error: ' + value);
          }
          t._rejecter(value);
        }
      });
    if (status === 1 || status === 2) {
      t._completed = true;
    }
    return q;
  },
});

exports.default = Transaction_MySQL;
module.exports = exports['default'];
