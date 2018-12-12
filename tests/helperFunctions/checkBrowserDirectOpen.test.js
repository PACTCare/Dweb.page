import checkBrowserDirectOpen from '../../src/js/helperFunctions/checkBrowserDirectOpen';

describe('checkBrowserDirectOpen', () => {
  it('open in Browser - true', () => {
    expect(checkBrowserDirectOpen('.htm')).toBeTruthy();
    expect(checkBrowserDirectOpen('.mp3')).toBeTruthy();
    expect(checkBrowserDirectOpen('.mp4')).toBeTruthy();
    expect(checkBrowserDirectOpen('.ogg')).toBeTruthy();
  });
  it('open in Browser - false', () => {
    expect(checkBrowserDirectOpen('xyz')).toBeFalsy();
  });
});
