import dayToLoadNr from '../../src/js/search/dayToLoadNr';

describe('dayToLoadNr', () => {
  it('Small Difference', () => {
    const result = dayToLoadNr(4, 10);
    expect(result).toBe(4);
  });
  it('Huge Difference', () => {
    const result = dayToLoadNr(4, 100);
    expect(result).toBe(80);
  });
  it('Wrong Numbers', () => {
    const result = dayToLoadNr(10, 1);
    expect(result).toBeUndefined();
  });
});
