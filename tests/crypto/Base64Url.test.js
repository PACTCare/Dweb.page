import Base64Url from '../../src/js/crypto/Base64Url';

const hexString = '11f138ac0ea6d9302e66d6ff69cbdee0e676275312d76486a6449ea7ad34c338';
const base64Url = 'EfE4rA6m2TAuZtb_acve4OZ2J1MS12SGpkSep600wzg';

describe('Base64Url', () => {
  it('From Hex', () => {
    const result = Base64Url.FromHex(hexString);
    expect(result).toBe(base64Url);
  });
  it('To Hex', () => {
    const result = Base64Url.ToHex(base64Url);
    expect(result).toBe(hexString);
  });
});
