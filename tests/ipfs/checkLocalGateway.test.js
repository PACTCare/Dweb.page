import checkLocalGateway from '../../src/js/ipfs/checkLocalGateway';

describe('getGateway', () => {
  it('localhost', () => {
    const result = checkLocalGateway();
    expect(result).toBe(true);
  });
});
