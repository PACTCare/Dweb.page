import shuffleArray from '../../src/js/helperFunctions/shuffelArray';

const TEST_ARRAY = ['a', 'b'];

describe('shuffel array', () => {
  it('same elements', () => {
    const result = shuffleArray(TEST_ARRAY);
    expect(result.length).toBe(2);
  });
});
