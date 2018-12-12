import getURLParameter from '../../src/js/helperFunctions/urlParameter';

it('urlParameter - undefined', () => {
  const result = getURLParameter('urlParameter');
  expect(result).toBeUndefined();
});
