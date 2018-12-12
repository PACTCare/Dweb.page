import compareTime from '../../src/js/helperFunctions/compareTime';

const timeObjOld = {
  time: 'Wed, 12 Dec 2018 10:33:04 GMT',
};
const timeObjNew = {
  time: 'Wed, 13 Dec 2018 10:33:04 GMT',
};
describe('compareTime', () => {
  it('equal', () => {
    const result = compareTime(timeObjOld, timeObjOld);
    expect(result).toBe(0);
  });

  it('old,new', () => {
    const result = compareTime(timeObjOld, timeObjNew);
    expect(result).toBe(1);
  });

  it('new,old', () => {
    const result = compareTime(timeObjNew, timeObjOld);
    expect(result).toBe(-1);
  });
});
