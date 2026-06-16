export interface Dua {
  id: string
  title: string
  arabic: string
  latin: string
  translation: string
  category: 'daily' | 'prayer' | 'protection' | 'hajj' | 'ramadan'
}

export const DUAS: Dua[] = [
  {
    id: 'before-sleeping',
    title: 'Doa Sebelum Tidur',
    arabic: 'بِاسْمِكَ اللّهُمَّ أَحْيَا وَأَمُوتُ',
    latin: 'Bismika allahumma ahya wa amut.',
    translation: 'Dengan nama-Mu ya Allah aku hidup dan aku mati.',
    category: 'daily'
  },
  {
    id: 'waking-up',
    title: 'Doa Bangun Tidur',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: 'Alhamdulillahil ladzi ahyana ba\'da ma amatana wa ilaihin nusyur.',
    translation: 'Segala puji bagi Allah yang menghidupkan kami kembali setelah mematikan kami dan kepada-Nya kami akan dibangkitkan.',
    category: 'daily'
  },
  {
    id: 'before-eating',
    title: 'Doa Sebelum Makan',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    latin: 'Allahumma barik lana fima razaqtana waqina \'adzaban nar.',
    translation: 'Ya Allah, berkahilah kami pada apa yang telah Engkau karuniakan kepada kami dan peliharalah kami dari siksa neraka.',
    category: 'daily'
  },
  {
    id: 'after-eating',
    title: 'Doa Setelah Makan',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin: 'Alhamdulillahil ladzi ath\'amana wa saqana wa ja\'alana muslimin.',
    translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami termasuk golongan orang-muslim.',
    category: 'daily'
  },
  {
    id: 'entering-bathroom',
    title: 'Doa Masuk Kamar Mandi',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    latin: 'Allahumma inni a\'udzu bika minal khubutsi wal khaba\'its.',
    translation: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan setan perempuan.',
    category: 'daily'
  },
  {
    id: 'leaving-bathroom',
    title: 'Doa Keluar Kamar Mandi',
    arabic: 'غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي',
    latin: 'Ghufranakal hamdu lillahil ladzi adzhaba \'annil adza wa \'afani.',
    translation: 'Aku memohon ampunan-Mu. Segala puji bagi Allah yang telah menghilangkan penyakit dari tubuhku dan menyehatkanku.',
    category: 'daily'
  },
  {
    id: 'leaving-home',
    title: 'Doa Keluar Rumah',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    latin: 'Bismillahi tawakkaltu \'alallahi la hawla wala quwwata illa billah.',
    translation: 'Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.',
    category: 'daily'
  },
  {
    id: 'entering-home',
    title: 'Doa Masuk Rumah',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    latin: 'Allahumma inni as\'aluka khairal mawliji wa khairal makhraji bismillahi walajna wa bismillahi kharajna wa \'alallahi rabbina tawakkalna.',
    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan tempat masuk dan kebaikan tempat keluar. Dengan menyebut nama Allah kami masuk, dan dengan menyebut nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.',
    category: 'daily'
  },
  {
    id: 'seeking-knowledge',
    title: 'Doa Memohon Ilmu yang Bermanfaat',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    latin: 'Allahumma inni as\'aluka \'ilman nafi\'an wa rizqan thayyiban wa \'amalan mutaqabbalan.',
    translation: 'Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.',
    category: 'daily'
  },
  {
    id: 'tranquility',
    title: 'Doa Memohon Ketenangan Hati',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً تُؤْمِنُ بِلِقَائِكَ وَتَرْضَى بِقَضَائِكَ وَتَقْنَعُ بِعَطَائِكَ',
    latin: 'Allahumma inni as\'aluka nafsan bika muthma\'innatan tu\'minu biliqa\'ika wa tardha biqadha\'ika wa taqna\'u bi\'atha\'ika.',
    translation: 'Ya Allah, aku memohon kepada-Mu jiwa yang tenang, yang percaya akan pertemuan dengan-Mu, yang rida atas ketetapan-Mu, dan merasa cukup dengan pemberian-Mu.',
    category: 'daily'
  }
]
