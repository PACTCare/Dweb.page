import SigCompression from '../../src/js/crypto/SigCompression';

const xbase64url = 'e8Ab369pVaRoEbuomTdVGBCT-Ngvmh3blXc_Hu4ykrg';
const ybase64url = 'TKHlhPTS0Bd0zfHakyoG3tcOxdLatQoWeEblCvwA9Zs';
const hexKey = '037bc01bdfaf6955a46811bba8993755181093f8d82f9a1ddb95773f1eee3292b8';

describe('SigCompression', () => {
  it('Compression', () => {
    const result = SigCompression.ECPointCompress(xbase64url, ybase64url);
    expect(result).toBe(hexKey);
  });
  it('Decompress', () => {
    const result = SigCompression.ECPointDecompress(hexKey);
    expect(result).toMatchObject({ x: xbase64url, y: ybase64url });
  });
});
