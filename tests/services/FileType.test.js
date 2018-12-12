import FileType from '../../src/js/services/FileType';

describe('FileType', () => {
  it('imageTypes', () => {
    const result = FileType.imageTypes();
    const imageArray = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp', 'tiff'];
    expect(result).toEqual(expect.arrayContaining(imageArray));
  });
  it('videoTypes', () => {
    const result = FileType.videoTypes();
    const videoArray = ['mp4', 'avi', 'wmv', 'flv', 'mov', 'webm'];
    expect(result).toEqual(expect.arrayContaining(videoArray));
  });
  it('musicTypes', () => {
    const result = FileType.musicTypes();
    const musicArray = ['mp3', 'wma', 'ogg', 'wav', 'acc', 'flac'];
    expect(result).toEqual(expect.arrayContaining(musicArray));
  });
});
