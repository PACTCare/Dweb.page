import checkIsMobile from '../../src/js/helperFunctions/checkIsMobile';

describe('checkIsMobile', () => {
  it('return false', () => {
    const result = checkIsMobile();
    expect(result).toBeFalsy();
  });
});
