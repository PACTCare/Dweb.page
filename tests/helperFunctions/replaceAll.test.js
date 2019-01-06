import replaceAll from '../../src/js/helperFunctions/replaceAll';

describe('replace All', () => {
  it('test two', () => {
    const result = replaceAll('test', 't', '');
    expect(result).toBe('es');
  });
});
