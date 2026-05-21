const fs = require('fs');
const path = require('path');

const srcDir = 'C:/mentos_os_clean/public/math_crops/확통수능/6)확률변수와이항분포/문제_files/';
const destDir = 'C:/mentos_os_clean/public/math_crops/확통수능/6)확률변수와이항분포/';

const mapping = [
  { "id": "001", "file": "dfc40fa831a2304be4c068069377e189.webp" },
  { "id": "002", "file": "b1fd59f267dfb427e0ea5afa4d9beca8.webp" },
  { "id": "003", "file": "ae260786d3152109e89f420c30ea1ba9.webp" },
  { "id": "004", "file": "1444acf4226cff2cf056c46d32c4f85d.webp" },
  { "id": "005", "file": "f60ee267c7c79315252d241c93d1522a.webp" },
  { "id": "006", "file": "514e75942270c6cd45e0158d9e131e1e.webp" },
  { "id": "007", "file": "d267df92630323ac17343d4ac0cf007c.webp" },
  { "id": "008", "file": "ee79eb004a28fbb23c0622495fb5543a.webp" },
  { "id": "009", "file": "8ba2c9d5372aa514654dc85b659180b9.webp" },
  { "id": "010", "file": "b6a20aa4c8ad42751ed7a82edd05942b.webp" },
  { "id": "011", "file": "99f43dacaea8a893535c9b971e8ec7e7.webp" },
  { "id": "012", "file": "7185ced2f2d49aefa219daf38b368e6d.webp" },
  { "id": "013", "file": "be3c542b708c576c4125e9b81dd99a70.webp" },
  { "id": "014", "file": "aa2c9e9edefe9b8a7d7b9d70856ef4c7.webp" },
  { "id": "015", "file": "63731f3b9de61f2144815a2d0e95a6ff.webp" },
  { "id": "016", "file": "7bcdb0b766842b4afab48460bea290ea.webp" },
  { "id": "017", "file": "2acfb878fa88fad7501adc1835933ccb.webp" },
  { "id": "018", "file": "0d7e0875259079151e286dc5de33bd21.webp" },
  { "id": "019", "file": "a2f393c7915b18c762aba73d96e7f4ba.webp" },
  { "id": "020", "file": "b2668149b524dc3a5882dcec6a6213f9.webp" },
  { "id": "021", "file": "56cdc54da04141efc0167ad0409dee77.webp" },
  { "id": "022", "file": "11caa65926c69f26cd8245be4e25be21.webp" },
  { "id": "023", "file": "3dc0a44b76d2803bc4a687e45768e69e.webp" },
  { "id": "024", "file": "80156b41bc4214237d47f052276862d3.webp" },
  { "id": "025", "file": "c49d0d0a5b83e19cfbc4895705bcf645.webp" },
  { "id": "026", "file": "2e8b777920bd34b3f72ac41a4fa241bf.webp" },
  { "id": "027", "file": "a61388f6796dd05a26cd6f31fd2ffaa6.webp" },
  { "id": "028", "file": "1bcfd29f480bd2cd27916b88ba7059e6.webp" },
  { "id": "029", "file": "4d2be42167374f1e0b5d41b6da00f155.webp" },
  { "id": "030", "file": "bf3302c24b71ada15850a8f6e4002dea.webp" },
  { "id": "031", "file": "d9cca3cea321a71706c0cd728b9e82ad.webp" },
  { "id": "032", "file": "2a6447967729dc3fcd391f27de15364b.webp" },
  { "id": "033", "file": "0f7775ab1717a1692de9cd6c7f159d79.webp" },
  { "id": "034", "file": "a1a2fc2467b3891d4395b9e9f67d2a6d.webp" },
  { "id": "035", "file": "822daf69b3cfdd63b08c16745bd19375.webp" },
  { "id": "036", "file": "1979c89fbb4083cd8554acf3fd879ade.webp" },
  { "id": "037", "file": "5bf53320e2053358a3fb60ced9a4cddd.webp" },
  { "id": "038", "file": "d20deb7ebdcfaed5c56348539a33d5e2.webp" },
  { "id": "039", "file": "4545e83b17a7264c4f6321f2a3a9f0ab.webp" },
  { "id": "040", "file": "909bb84d52fddc4c5b3fe1234c87f2fc.webp" },
  { "id": "041", "file": "e79cea806b360d28c80deac6982edf69.webp" },
  { "id": "042", "file": "6c24dcc12928ef68448b36e231769a8a.webp" },
  { "id": "043", "file": "7e1a0da4da26db216c7fb21db06b4644.webp" },
  { "id": "044", "file": "d8ee668e194b6fc1b63f86e9d9ed957e.webp" },
  { "id": "045", "file": "cf5bb1d889357511789810a9e2ea778f.webp" },
  { "id": "046", "file": "44f99b5fd50de117eb884377af2121cf.webp" },
  { "id": "047", "file": "86c45569b542e12e00071f232825090f.webp" },
  { "id": "048", "file": "03088124a5295ba4f376d8bc94b86eb8.webp" },
  { "id": "049", "file": "3891e176eb778d38737dee18cd1cf14b.webp" },
  { "id": "050", "file": "11664471d1ff2309cee623a53153d783.webp" },
  { "id": "051", "file": "ac034798ac60be2210b52be577e985c6.webp" },
  { "id": "052", "file": "a121f73a5a27e19941a8dd3e11d587a8.webp" },
  { "id": "053", "file": "ac4241837e6603918721e4f25a3e06e1.webp" },
  { "id": "054", "file": "eac38dbcf5d24394536b4098568137a4.webp" }
];

mapping.forEach(m => {
  const src = path.join(srcDir, m.file);
  const dest = path.join(destDir, m.id + '.webp');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

console.log('Mapping done.');
