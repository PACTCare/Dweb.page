/**
 * Class to structure the supported file types into imageTypes, videoTypes and musicTypes
 */
export default class FileType {
  /**
   * Returns an array of image types
   */
  static imageTypes() {
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp', 'tiff'];
  }

  /**
  * Returns an array of video types
  */
  static videoTypes() {
    return ['mp4', 'avi', 'wmv', 'flv', 'mov', 'webm'];
  }

  /**
  * Returns an array of music types
  */
  static musicTypes() {
    return ['mp3', 'wma', 'ogg', 'wav', 'acc', 'flac'];
  }

  /**
   * Returns the font awesome icon for specific file types
   * @param {string} fileType
   */
  static returnFileIcon(fileType) {
    const lowerFileType = fileType.toLowerCase();
    if (FileType.imageTypes().indexOf(lowerFileType) > -1) {
      return '<i class="far fa-image"></i>';
    }
    if (FileType.videoTypes().indexOf(lowerFileType) > -1) {
      return '<i class="fas fa-video"></i>';
    }
    if (FileType.musicTypes().indexOf(lowerFileType) > -1) {
      return '<i class="fas fa-music"></i>';
    }
    return '<i class="far fa-file"></i>';
  }
}
