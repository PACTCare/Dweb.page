import addZeroIfLessThan64 from '../../src/js/crypto/addZeroIfLessThan64';

const HEX64 = '11f138ac0ea6d9302e66d6ff69cbdee0e676275312d76486a6449ea7ad34c338';
const HEX63 = 'd328fc6deca7a54290911019b561245351fd0a3e61d21582a320179662b187f';

describe('addZeroIfLessThan64', () => {
  it('Hex 64', () => {
    const result = addZeroIfLessThan64(HEX64);
    expect(result).toBe(HEX64);
  });
  it('Hex 63', () => {
    const result = addZeroIfLessThan64(HEX63);
    expect(result).toBe(`0${HEX63}`);
  });
});
