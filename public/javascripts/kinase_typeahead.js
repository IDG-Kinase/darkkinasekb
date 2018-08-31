var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

var dark_kinases = ['ADCK1', 'ADCK2', 'ADCK5', 'ALPK2', 'ALPK3', 'BCKDK',
  'BRSK1', 'BRSK2', 'CAMK1D', 'CAMK1G', 'CAMKK1', 'CAMKK2', 'CAMKV',
  'CDC42BPA', 'CDC42BPB', 'CDC42BPG', 'CDK10', 'CDK11A', 'CDK11B', 'CDK12',
  'CDK13', 'CDK14', 'CDK15', 'CDK16', 'CDK17', 'CDK18', 'CDK19', 'CDK20',
  'CDKL1', 'CDKL2', 'CDKL3', 'CDKL4', 'CDKL5', 'CLK3', 'CLK4', 'COQ8A',
  'COQ8B', 'CSNK1A1L', 'CSNK1G1', 'CSNK1G2', 'CSNK1G3', 'CSNK2A2', 'CSNK2A3',
  'DCLK3', 'DSTYK', 'DYRK1B', 'DYRK2', 'DYRK3', 'DYRK4', 'EEF2K', 'ERN2',
  'HIPK1', 'HIPK3', 'HIPK4', 'ICK', 'LMTK2', 'LMTK3', 'LRRK1', 'LTK',
  'MAP3K10', 'MAP3K14', 'MAP3K15', 'MAP3K21', 'MAPK4', 'MAPK15', 'MARK1',
  'MARK3', 'MARK4', 'MAST2', 'MAST3', 'MAST4', 'MKNK1', 'MKNK2', 'NEK1',
  'NEK3', 'NEK4', 'NEK5', 'NEK6', 'NEK7', 'NEK8', 'NEK9', 'NEK10', 'NEK11',
  'NIM1K', 'NRBP2', 'NRK', 'NUAK2', 'OBSCN', 'PAK3', 'PAK5', 'PAK6', 'PAN3',
  'PDIK1L', 'PHKG1', 'PHKG2', 'PI4KA', 'PIK3C2B', 'PIK3C2G', 'PIP4K2C',
  'PIP5K1A', 'PIP5K1B', 'PIP5K1C', 'PKMYT1', 'PKN3', 'PNCK', 'POMK', 'PRAG1',
  'PRKACB', 'PRKACG', 'PRKCQ', 'PRPF4B', 'PSKH1', 'PSKH2', 'PXK', 'RIOK1',
  'RIOK2', 'RIOK3', 'RNASEL', 'RPS6KC1', 'RPS6KL1', 'SBK1', 'SBK2', 'SBK3',
  'SCYL1', 'SCYL2', 'SCYL3', 'SRPK3', 'STK3', 'STK17A', 'STK17B', 'STK19',
  'STK31', 'STK32A', 'STK32B', 'STK32C', 'STK33', 'STK36', 'STK38L', 'STK40',
  'STKLD1', 'TAOK1', 'TAOK2', 'TBCK', 'TESK1', 'TESK2', 'TLK1', 'TLK2',
  'TP53RK', 'TSSK1B', 'TSSK2', 'TSSK3', 'TSSK4', 'TSSK6', 'TTBK1', 'TTBK2',
  'ULK4', 'VRK2', 'VRK3', 'WEE2', 'WNK2', 'WNK3'];

$('#kinase-search .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
  {
    name: 'dark_kinases',
    limit: 10,
    source: substringMatcher(dark_kinases)
  });
