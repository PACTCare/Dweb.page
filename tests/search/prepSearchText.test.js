import prepSearchText from '../../src/js/search/prepSearchText';

const exampleTextWithAnd = 'The&&test example';
const exampleTextWithoutAnd = 'The test example';

describe('prepSearchText', () => {
  it('Text longer with &&', () => {
    const result = prepSearchText(exampleTextWithAnd, 10);
    expect(result).toBe('Test');
  });
  it('Text shorter with &&', () => {
    const result = prepSearchText(exampleTextWithAnd, 100);
    expect(result).toBe('Test example');
  });
  it('Text shorter without &&', () => {
    const result = prepSearchText(exampleTextWithoutAnd, 5);
    expect(result).toBe('The');
  });
  it('Text shorter without &&', () => {
    const result = prepSearchText(exampleTextWithoutAnd, 100);
    expect(result).toBe(exampleTextWithoutAnd);
  });
});
