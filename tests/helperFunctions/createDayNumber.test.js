import createDayNumber from '../../src/js/helperFunctions/createDayNumber';

it('createDayNumber', () => {
  const result = createDayNumber();
  expect(result).toBeGreaterThan(1);
});
