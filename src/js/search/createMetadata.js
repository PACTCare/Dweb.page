import addMetaData from './addMetadata';
import prepMetaData from './prepMetaData';
import logDb from '../log/logDb';
import MetadataDb from './MetadataDb';
import removeMetaData from './removeMetaData';

/**
 * Prepares and sends metadata to Starlog as well as logDB
 * @param {*} fileId
 * @param {*} fileNameType
 * @param {*} gateway
 * @param {*} description
 * @param {*} licenseCode
 * @param {*} price
 */
export default async function createMetadata(fileId, fileNameType,
  gateway, description, licenseCode, price) {
  // Own time for own DB entry, others use the chain timestamp
  const time = new Date().toUTCString();
  const [, fileNamePart, fileTypePart] = fileNameType.match(/(.*)\.(.*)/);
  let dbWorks = true;
  try {
    await logDb.log.add({
      fileId,
      filename: fileNameType,
      time,
      price,
      isUpload: true,
      isPrivate: false,
      folder: 'none',
    });
  } catch (error) {
    dbWorks = false;
  }

  let metadata = {
    fileName: fileNamePart,
    fileType: fileTypePart,
    description,
  };
  metadata = prepMetaData(metadata);

  // store available data on Starlog

  await window.starlog.storeMeta(fileId, licenseCode, price, gateway, JSON.stringify(metadata));

  // add metadata to search
  metadata.gateway = gateway;
  metadata.fileId = fileId;
  metadata.time = time;
  metadata.price = price;


  if (dbWorks) {
    await new MetadataDb().add(metadata);
  } else {
    addMetaData(metadata);
  }

  // TODO: fix unavailable system in extra file
  // if (description !== UNAVAILABLE_DESC) {

  // } else {
  //   removeMetaData(metadata);
  //   try {
  //     await new MetadataDb().noLongerAvailable(metadata);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
