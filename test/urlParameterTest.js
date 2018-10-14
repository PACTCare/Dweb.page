import GetURLParameter from '../src/js/services/urlParameter';

const assert = require('chai').assert;

describe('urlParameter', () => {
  it('GetUrl should return type undefined (no URL while testing)', () => {
    assert.isUndefined(GetURLParameter('test'));
  });
});
