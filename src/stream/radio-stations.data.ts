export interface RadioStation {
  id: string;
  name: string;
  sourcePage: string;
  streamUrl: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'aktiv-radio',
    name: 'Aktív Rádió',
    sourcePage: 'https://netradio.online/aktiv-radio',
    streamUrl:
      'https://radio.broker/proxy/?q=http://www.aktivradio.hu:8000/aktiv.mp3',
  },
  {
    id: 'bartok-radio',
    name: 'Bartók Rádió',
    sourcePage: 'https://netradio.online/bartok-radio',
    streamUrl: 'http://icast.connectmedia.hu/4741/mr3.mp3',
  },
  {
    id: 'base-fm',
    name: 'Base FM',
    sourcePage: 'https://netradio.online/base-fm',
    streamUrl: 'https://icast.connectmedia.hu/5401/live.mp3',
  },
  {
    id: 'best-fm-budapest',
    name: 'Best FM Budapest',
    sourcePage: 'https://netradio.online/best-fm-budapest',
    streamUrl: 'https://icast.connectmedia.hu/5102/live.mp3',
  },
  {
    id: 'best-fm-debrecen',
    name: 'Best FM Debrecen',
    sourcePage: 'https://netradio.online/best-fm-debrecen',
    streamUrl:
      'https://radio.broker/proxy/?q=http://stream.webthings.hu:8000/fm95-x-128.mp3',
  },
  {
    id: 'civil-radio',
    name: 'Civil Rádió - FM 98',
    sourcePage: 'https://netradio.online/civil-radio',
    streamUrl: 'https://radio.broker/proxy/?q=http://civilradio.hu:8000/;',
  },
  {
    id: 'cool-fm',
    name: 'Cool FM',
    sourcePage: 'https://netradio.online/cool-fm',
    streamUrl: 'https://mediagw.e-tiger.net/stream/coolfm',
  },
  {
    id: 'csukas-meseradio',
    name: 'Csukás Meserádió',
    sourcePage: 'https://netradio.online/csukas-meseradio',
    streamUrl: 'https://mr-stream.connectmedia.hu/4611/mr10.mp3',
  },
  {
    id: 'danko-radio',
    name: 'Dankó Rádió',
    sourcePage: 'https://netradio.online/danko-radio',
    streamUrl: 'http://icast.connectmedia.hu/4748/mr7.mp3',
  },
  {
    id: 'forras-radio',
    name: 'Forrás Rádió',
    sourcePage: 'https://netradio.online/forras-radio',
    streamUrl: 'https://cloudfront44.lexanetwork.com:1540/forrasradio.mp3',
  },
  {
    id: 'friss-fm',
    name: 'Friss FM - Kisvárda',
    sourcePage: 'https://netradio.online/friss-fm',
    streamUrl: 'https://radio.broker/proxy/?q=http://stream.frissfm.hu:10050/;',
  },
  {
    id: 'fun-fm-radio',
    name: 'Fun FM Rádió',
    sourcePage: 'https://netradio.online/fun-fm-radio',
    streamUrl: 'https://online.funfm.ro:8001/funfm.mp3',
  },
  {
    id: 'gong-radio',
    name: 'Gong Rádió',
    sourcePage: 'https://netradio.online/gong-radio',
    streamUrl: 'https://icast.connectmedia.hu/5241/live.mp3',
  },
  {
    id: 'gyor-plusz-radio',
    name: 'Győr Plusz Rádió',
    sourcePage: 'https://netradio.online/gyor-plusz-radio',
    streamUrl: 'https://stream.42netmedia.com:8443/sc_gyor1',
  },
  {
    id: 'hir-fm',
    name: 'Hír.FM',
    sourcePage: 'https://netradio.online/hir-fm',
    streamUrl: 'https://stream.karcfm.hu/',
  },
  {
    id: 'hit-radio',
    name: 'Hit rádió',
    sourcePage: 'https://netradio.online/hit-radio',
    streamUrl: 'https://streamer.radio.co/s47952d7c4/listen',
  },
  {
    id: 'infostart-inforadio',
    name: 'Infostart - InfoRádió',
    sourcePage: 'https://netradio.online/infostart-inforadio',
    streamUrl: 'https://stream.infostart.hu/lejatszo/index.html?sid=1',
  },
  {
    id: 'jazzy-radio',
    name: 'Jazzy Rádió',
    sourcePage: 'https://netradio.online/jazzy-radio',
    streamUrl: 'https://jazzy.hu/jazzy.mp3',
  },
  {
    id: 'karacsonyi-radio-5',
    name: 'Karácsonyi rádió 5',
    sourcePage: 'https://netradio.online/karacsonyi-radio-5',
    streamUrl: 'https://stream02.iloveradio.de/iloveradio8.mp3',
  },
  {
    id: 'katolikus-radio',
    name: 'Katolikus Rádió',
    sourcePage: 'https://netradio.online/katolikus-radio',
    streamUrl: 'https://katolikusradio.hu:8001/live_hi.mp3',
  },
  {
    id: 'klasszik-radio',
    name: 'Klasszik rádió',
    sourcePage: 'https://netradio.online/klasszik-radio',
    streamUrl: 'https://s04.diazol.hu:9602/live.mp3',
  },
  {
    id: 'klubradio',
    name: 'Klubrádió',
    sourcePage: 'https://netradio.online/klubradio',
    streamUrl: 'https://stream.klubradio.hu:8443/',
  },
  {
    id: 'koronafm100',
    name: 'KORONAfm100',
    sourcePage: 'https://netradio.online/koronafm100',
    streamUrl: 'https://koronafm100.hu/live.mp3',
  },
  {
    id: 'kossuth-radio',
    name: 'Kossuth Rádió',
    sourcePage: 'https://netradio.online/kossuth-radio',
    streamUrl: 'https://mr-stream.connectmedia.hu/4736/mr1.mp3',
  },
  {
    id: 'laza-radio',
    name: 'Laza Rádió',
    sourcePage: 'https://netradio.online/laza-radio',
    streamUrl: 'https://stream.lazaradio.com/live.mp3',
  },
  {
    id: 'lepes-radio',
    name: 'Lépés Rádió',
    sourcePage: 'https://netradio.online/lepes-radio',
    streamUrl: 'https://lepesradio.hu/live.mp3',
  },
  {
    id: 'luxfunk-radio',
    name: 'Luxfunk Radio',
    sourcePage: 'https://netradio.online/luxfunk-radio',
    streamUrl: 'https://luxfunkbroadcast.com/proxy/luxfunkradio/stream',
  },
  {
    id: 'manna-fm',
    name: 'Manna FM 98.6',
    sourcePage: 'https://netradio.online/manna-fm',
    streamUrl: 'https://icast.connectmedia.hu/4780/live.mp3',
  },
  {
    id: 'maria-radio',
    name: 'Mária Rádió',
    sourcePage: 'https://netradio.online/maria-radio',
    streamUrl: 'https://stream.mariaradio.hu:8000/mr',
  },
  {
    id: 'megadance-radio',
    name: 'MegaDance Rádió',
    sourcePage: 'https://netradio.online/megadance-radio',
    streamUrl: 'https://gamershouse.hu:8080/livemega.mp3',
  },
  {
    id: 'miradionk',
    name: 'MiRádiónk',
    sourcePage: 'https://netradio.online/miradionk',
    streamUrl: 'https://stream.42netmedia.com:8443/sc_mirad',
  },
  {
    id: 'momo-radio-zene',
    name: 'Momó Rádió',
    sourcePage: 'https://netradio.online/momo-radio-zene',
    streamUrl: 'https://s03.diazol.hu:7092/zene.mp3',
  },
  {
    id: 'nemzeti-sportradio',
    name: 'Nemzeti Sportrádió',
    sourcePage: 'https://netradio.online/nemzeti-sportradio',
    streamUrl: 'https://icast.connectmedia.hu/4656/mr11.aac',
  },
  {
    id: 'nextfm',
    name: 'Next FM',
    sourcePage: 'https://netradio.online/nextfm',
    streamUrl: 'https://stream.nextfm.hu/radio/8000/nextfmhu.mp3',
  },
  {
    id: 'paksfm',
    name: 'PAKS FM.',
    sourcePage: 'https://netradio.online/paksfm',
    streamUrl:
      'https://radio.broker/proxy/?q=http://str2.42net.hu:8000/paks_fm',
  },
  {
    id: 'papageno',
    name: 'Papageno Rádió',
    sourcePage: 'https://netradio.online/papageno',
    streamUrl:
      'https://onair7.xdevel.com/proxy/xautocloud_o3yj_837?mp=/;stream/;',
  },
  {
    id: 'paprika-radio',
    name: 'Paprika Rádió',
    sourcePage: 'https://netradio.online/paprika-radio',
    streamUrl: 'https://stream1.paprikaradio.ro/;',
  },
  {
    id: 'petofi-radio',
    name: 'Petőfi Rádió',
    sourcePage: 'https://netradio.online/petofi-radio',
    streamUrl: 'https://mr-stream.connectmedia.hu/4738/mr2.mp3',
  },
  {
    id: 'poptarisznya',
    name: 'Poptarisznya',
    sourcePage: 'https://netradio.online/poptarisznya',
    streamUrl: 'https://stream1.virtualisan.net/prx/8200/live.mp3',
  },
  {
    id: 'radio-1',
    name: 'Rádió 1',
    sourcePage: 'https://netradio.online/radio-1',
    streamUrl: 'https://icast.connectmedia.hu/5201/live.mp3',
  },
  {
    id: 'radio-24',
    name: 'Rádió 24',
    sourcePage: 'https://netradio.online/radio-24',
    streamUrl: 'https://s01.diazol.hu:10102/live.mp3',
  },
  {
    id: 'radio-7',
    name: 'Rádió 7',
    sourcePage: 'https://netradio.online/radio-7',
    streamUrl: 'https://stormwind.meatkult.com/test.mp3',
  },
  {
    id: 'radio-88',
    name: 'Rádió 88',
    sourcePage: 'https://netradio.online/radio-88',
    streamUrl: 'https://stream.radio88.hu/onair.mp3',
  },
  {
    id: 'radio-bezs',
    name: 'Rádió Bézs',
    sourcePage: 'https://netradio.online/radio-bezs',
    streamUrl: 'https://stream.radiobezs.hu:8011/bezs',
  },
  {
    id: 'radio-dabas',
    name: 'Rádió Dabas',
    sourcePage: 'https://netradio.online/radio-dabas',
    streamUrl:
      'https://radio.broker/proxy/?q=http://stream3.virtualisan.net:7040/;',
  },
  {
    id: 'radio-gaga',
    name: 'Rádió Gaga',
    sourcePage: 'https://netradio.online/radio-gaga',
    streamUrl: 'https://a3.my-control-panel.com:6660/radio.mp3',
  },
  {
    id: 'radio-groove',
    name: 'Rádió Groove',
    sourcePage: 'https://netradio.online/radio-groove',
    streamUrl: 'https://s03.diazol.hu:35112/live.mp3',
  },
  {
    id: 'radio-m',
    name: 'Rádió M',
    sourcePage: 'https://netradio.online/radio-m',
    streamUrl:
      'https://radio.broker/proxy/?q=http://hosting2.42netmedia.com:10060/;stream.mp3',
  },
  {
    id: 'radio-most',
    name: 'Rádió Most',
    sourcePage: 'https://netradio.online/radio-most',
    streamUrl: 'https://webradio.ev2.hu:8202/live.mp3',
  },
  {
    id: 'radio-smile',
    name: 'Rádió Smile',
    sourcePage: 'https://netradio.online/radio-smile',
    streamUrl: 'https://smile.str.42net.hu/stream/;',
  },
  {
    id: 'radiocafe98',
    name: 'radiocafé 98.0',
    sourcePage: 'https://netradio.online/radiocafe98',
    streamUrl: 'https://radio.radiocafe98.hu/radiocafe98_192k',
  },
  {
    id: 'radiosense',
    name: 'Radio Sense Hungary',
    sourcePage: 'https://netradio.online/radiosense',
    streamUrl: 'https://s03.diazol.hu:7010/stream.mp3',
  },
  {
    id: 'retro-radio',
    name: 'Retro Rádió',
    sourcePage: 'https://netradio.online/retro-radio',
    streamUrl: 'https://icast.connectmedia.hu/5001/live.mp3',
  },
  {
    id: 'rock-radio',
    name: '103.9 Rock FM',
    sourcePage: 'https://netradio.online/rock-radio',
    streamUrl: 'https://stream.rockradio.hu/',
  },
  {
    id: 'slager-fm',
    name: 'Sláger FM',
    sourcePage: 'https://netradio.online/slager-fm',
    streamUrl: 'https://slagerfm.netregator.hu:7813/slagerfm128.mp3',
  },
  {
    id: 'sunshine-radio',
    name: 'Sunshine Rádió',
    sourcePage: 'https://netradio.online/sunshine-radio',
    streamUrl: 'https://sunshine1.stream.composeit.hu/sunshine',
  },
  {
    id: 'szent-korona-radio',
    name: 'Szent Korona Rádió',
    sourcePage: 'https://netradio.online/szent-korona-radio',
    streamUrl: 'https://szkrcast.ddns.net/radio/8000/radio.mp3',
  },
  {
    id: 'taska-radio',
    name: 'Táska Rádió',
    sourcePage: 'https://netradio.online/taska-radio',
    streamUrl: 'https://stream1.virtualisan.net/prx/7070/',
  },
  {
    id: 'tilos-radio',
    name: 'Tilos Rádió',
    sourcePage: 'https://netradio.online/tilos-radio',
    streamUrl: 'https://stream.tilos.hu/tilos_128.mp3',
  },
  {
    id: 'trend-fm',
    name: 'Trend FM',
    sourcePage: 'https://netradio.online/trend-fm',
    streamUrl: 'https://radio.trendfm.hu/trendfm_192k',
  },
  {
    id: 'vorosmarty-radio',
    name: 'Vörösmarty Rádió',
    sourcePage: 'https://netradio.online/vorosmarty-radio',
    streamUrl: 'https://cloudfront41.lexanetwork.com:7604/livestream.mp3',
  },
];
