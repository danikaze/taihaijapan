import mockupData from './mockupData';

function setMockupData(...args) {
  let data;

  if (args.length === 2) {
    data = {};
    data[args[0]] = args[1];
  } else if (args.length === 1) {
    data = args[0];
  } else {
    throw new Error('setMockupData: wrong parameters');
  }

  Object.assign(mockupData, data);
}

module.exports = setMockupData;
