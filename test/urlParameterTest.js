import GetURLParameter from '../src/js/services/urlParameter';

const assert = require('chai').assert;

describe('urlParameter', () => {
  it('Get Url should return undefined (no URL while testing)', () => {
    assert.isUndefined(GetURLParameter('test'));
  });
});
