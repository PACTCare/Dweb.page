import createDayNumber from '../../src/js/search/createDayNumber';

it('createDayNumber', () => {
  const result = createDayNumber();
  expect(result).toBeGreaterThan(0);
});
