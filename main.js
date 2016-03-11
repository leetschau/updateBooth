var cmdFormat = 'node main.js <xlsx-file-name> <mongo-string> <expomap-id>';
var example = 'node main.js input.xlsx abc:def@1.2.3.4:27017/test ' +
              'eDyzxEi5kTtHK97iB';
if (process.argv.length !== 5) {
  console.log('Bad format, updating cancelled.');
  console.log('Format:');
  console.log(cmdFormat);
  console.log('Example:');
  console.log(example);
  return;
}

var indexDict = {
  boothIdCol: 'C',
  width: 'E',
  length: 'D',
  area: 'F',
  openSides: 'G',
  boothType: 'I',
  accessories: [
    { col: 'X', name: '洽谈方桌' },
    { col: 'Y', name: '洽谈圆桌' },
    { col: 'Z', name: '带锁咨询台' },
    { col: 'AA', name: '无锁咨询台' },
    { col: 'AB', name: '无电源插座' },
    { col: 'AC', name: '带电源插座' },
    { col: 'AD', name: '洽谈椅' },
    { col: 'AE', name: '层板' },
    { col: 'AF', name: '楣板' },
    { col: 'AG', name: '地毯' },
    { col: 'AH', name: '垃圾筐' },
    { col: 'AI', name: '资料架' },
    { col: 'AJ', name: '射灯' },
    { col: 'AK', name: '墙板' }
  ]
};

var sideDict = {'一面开口': 'one-side',
                '二面开口': 'two-side',
                '三面开口': 'three-side',
                '四面开口': 'four-side' };

var boothTypeDict = {
  '标摊': 'standard',
  '光地': 'plain',
  '精装': 'decorated'
};

var xlsxFile = process.argv[2];
var targetMongo = process.argv[3];
var expomapId = process.argv[4];
var targetCollection = ['ExpomapBooth'];
var XLSX = require('xlsx');
var workbook = XLSX.readFile(xlsxFile);
var first_sheet_name = workbook.SheetNames[0];
var worksheet = workbook.Sheets[first_sheet_name];

var mongojs = require('mongojs');
var db = mongojs(targetMongo, targetCollection);

var boothCountInFile = 0;
var updatedBoothNum = 0;
for (key in worksheet) {
  if (!key.startsWith(indexDict.boothIdCol)) { continue; }
  if (! /[A-Z0-9]+/.test(worksheet[key].v)) {
    console.log('Bad format: booth Id: ' + worksheet[key].v + ' skipped.');
    continue;
  }
  boothCountInFile = boothCountInFile + 1;
  console.log('starting exact a booth, boothCountInFile=' + boothCountInFile);
  var utteranceId = worksheet[key].v;
  //console.log(utteranceId);
  var rowNum = key.slice(1);
  var accessories = indexDict.accessories.map(
    function(acc) { return { kind: acc.name,
                             quantity: worksheet[acc.col + rowNum].v
                           };
    }
  ).filter(function(acc) { return acc.quantity > 0; });
  var info = {
    width: worksheet[indexDict.width + rowNum].v,
    length: worksheet[indexDict.length + rowNum].v,
    area: worksheet[indexDict.area + rowNum].v,
    openSides: sideDict[worksheet[indexDict.openSides + rowNum].v],
    boothType: boothTypeDict[worksheet[indexDict.boothType + rowNum].v],
    accessories: accessories
  };

  db.ExpomapBooth.findOne({'expomapId': expomapId, 'uttranceId': utteranceId},
      function(err, doc) {
        if (!err) {
          console.log('updating: ' + doc._id);
          db.ExpomapBooth.update({_id: doc._id}, {$set: {info: info} },
               function() {
                 updatedBoothNum = updatedBoothNum + 1;
                 if (boothCountInFile === updatedBoothNum) {
                   console.log('doc ' + doc._id + ' update over, closing db');
                   db.close();
                 }
               });
        }
        else { console.log(err); }
      });
  console.log('updating a booth over');
}
