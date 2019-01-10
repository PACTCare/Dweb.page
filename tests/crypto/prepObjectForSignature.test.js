import prepObjectForSignature from '../../src/js/crypto/prepObjectForSignature';

const testObj = {
  signature: 'signature', address: 'address', tag: 'tag', hello: 'hello',
};
const resultObj = {
  hello: 'hello',
};

describe('prepObjectForSignature', () => {
  it('Hex 64', () => {
    const result = prepObjectForSignature(testObj);
    expect(result).toMatchObject(resultObj);
  });
});
