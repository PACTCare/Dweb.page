import getGateway from '../../src/js/ipfs/getGateway';

describe('getGateway', () => {
  it('localhost', () => {
    // see package.json for test url config
    // window.location.href = 'http://localhost:8080/ipfs/QmSS34C6PzXVJTjMzqggZT34ibf4QE49b5kXRzLHdyBL7y';
    const result = getGateway();
    expect(result).toBe('http://localhost:8080/ipfs/');
  });
});
