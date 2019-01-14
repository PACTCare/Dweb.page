import prepMetaData from '../../src/js/search/prepMetaData';

const LoremIpsum = 'Lorem ipsum dolor sit amet, sit ut legimus denique, ut pro vulputate reformidans. Ad cibo cetero consequuntur has, labores mediocritatem his ex, cibo efficiantur est cu. Id vim vivendo epicurei, id corpora propriae eam, cu quando propriae salutandi pri. In nulla graece offendit nec. Singulis quaestio volutpat in usu, labore percipitur ut vel. An ius civibus torquatos, delectus recusabo urbanitas et pri. No labore malorum ius, in usu splendide assentior. Mel modo adipiscing ullamcorper ei, nusquam conclusionemque vix at, ne vide dicat aeterno has.';

const metaObj = {
  fileName: LoremIpsum,
  fileType: LoremIpsum,
  description: LoremIpsum,
};

describe('prepMetaData', () => {
  it('Less than or equal', () => {
    const result = prepMetaData(metaObj);
    expect(result.description.length).toBeLessThanOrEqual(500);
    expect(result.fileName.length).toBeLessThanOrEqual(100);
    expect(result.fileType.length).toBeLessThanOrEqual(15);
  });
});
