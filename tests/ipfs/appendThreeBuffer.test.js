import appendThreeBuffer from '../../src/js/ipfs/appendThreeBuffer';

const buffer = Buffer.from('test');
describe('appendThreeBuffer', () => {
  it('input 3 buffer', () => {
    const result = appendThreeBuffer(buffer, buffer, buffer);
    expect(result).toBeDefined();
  });
});
