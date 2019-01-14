import addMetadata from '../../src/js/search/addMetadata';

const metaObj = {
  fileId: 'a', fileName: 'b', fileType: 'c', description: 'd',
};

describe('addMetadata', () => {
  it('correct Obj', () => {
    window.metadata = [];
    window.miniSearch = {
      add: jest.fn(),
    };
    addMetadata(metaObj);
    expect(window.metadata.length).toBe(1);
    expect(window.miniSearch.add).toBeCalled();
  });
});
