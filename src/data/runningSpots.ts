import type { Lang } from '../i18n/strings';

export interface RunningSpot {
  id: string;
  name: Record<Lang, string>;
  area: Record<Lang, string>;
  note: Record<Lang, string>;
  // A common meeting point at the spot (approximate; runners can drag the pin)
  lat: number;
  lng: number;
}

export const RUNNING_SPOTS: RunningSpot[] = [
  {
    id: 'imperial-palace',
    name: { en: 'Imperial Palace loop (Sakuradamon)', ja: '皇居ランニングコース（桜田門）' },
    area: { en: 'Chiyoda, Tokyo', ja: '東京・千代田区' },
    note: { en: '5km loop with no traffic lights', ja: '1周約5km・信号なし' },
    lat: 35.6778,
    lng: 139.7524,
  },
  {
    id: 'yoyogi',
    name: { en: 'Yoyogi Park (Harajuku gate)', ja: '代々木公園（原宿門）' },
    area: { en: 'Shibuya, Tokyo', ja: '東京・渋谷区' },
    note: { en: 'Shaded park paths next to Harajuku', ja: '原宿駅すぐ、木陰の多い園内コース' },
    lat: 35.6705,
    lng: 139.696,
  },
  {
    id: 'jingu-gaien',
    name: { en: 'Meiji Jingu Gaien', ja: '明治神宮外苑' },
    area: { en: 'Minato, Tokyo', ja: '東京・港区' },
    note: { en: 'About 1.3km loop by the ginkgo avenue', ja: 'いちょう並木周辺の1周約1.3km' },
    lat: 35.6752,
    lng: 139.7177,
  },
  {
    id: 'komazawa',
    name: { en: 'Komazawa Olympic Park', ja: '駒沢オリンピック公園' },
    area: { en: 'Setagaya, Tokyo', ja: '東京・世田谷区' },
    note: { en: '2.1km jogging course with distance markers', ja: '距離表示つきの2.1kmジョギングコース' },
    lat: 35.6254,
    lng: 139.6612,
  },
  {
    id: 'kinuta',
    name: { en: 'Kinuta Park', ja: '砧公園' },
    area: { en: 'Setagaya, Tokyo', ja: '東京・世田谷区' },
    note: { en: 'Wooded loop around a wide lawn', ja: '広い芝生を囲む木立の周回コース' },
    lat: 35.634,
    lng: 139.628,
  },
  {
    id: 'tamagawa',
    name: { en: 'Tama River (Futako-Tamagawa)', ja: '多摩川河川敷（二子玉川）' },
    area: { en: 'Setagaya, Tokyo', ja: '東京・世田谷区' },
    note: { en: 'Long, wide riverside path', ja: '長く広い河川敷コース' },
    lat: 35.6105,
    lng: 139.6295,
  },
  {
    id: 'sumida',
    name: { en: 'Sumida River Terrace (Asakusa)', ja: '隅田川テラス（浅草）' },
    area: { en: 'Taito, Tokyo', ja: '東京・台東区' },
    note: { en: 'Flat riverside path with Skytree views', ja: 'スカイツリーを望むフラットな川沿い' },
    lat: 35.7105,
    lng: 139.7975,
  },
  {
    id: 'arakawa',
    name: { en: 'Arakawa River (Kita-Senju)', ja: '荒川河川敷（北千住）' },
    area: { en: 'Adachi, Tokyo', ja: '東京・足立区' },
    note: { en: 'Long, flat riverbank for marathon training', ja: 'フラットで長い、マラソン練習の定番' },
    lat: 35.7555,
    lng: 139.8045,
  },
  {
    id: 'odaiba',
    name: { en: 'Odaiba Seaside Park', ja: 'お台場海浜公園' },
    area: { en: 'Minato, Tokyo', ja: '東京・港区' },
    note: { en: 'Seaside path with Rainbow Bridge views', ja: 'レインボーブリッジを望む海沿い' },
    lat: 35.6298,
    lng: 139.7768,
  },
  {
    id: 'yamashita',
    name: { en: 'Yamashita Park', ja: '山下公園' },
    area: { en: 'Yokohama', ja: '横浜' },
    note: { en: 'Harbor-side promenade', ja: '港沿いの遊歩道' },
    lat: 35.4463,
    lng: 139.6503,
  },
  {
    id: 'osaka-castle',
    name: { en: 'Osaka Castle Park', ja: '大阪城公園' },
    area: { en: 'Osaka', ja: '大阪' },
    note: { en: 'Loops around the castle moats', ja: 'お堀を囲む周回コース' },
    lat: 34.6863,
    lng: 135.5265,
  },
  {
    id: 'kamogawa',
    name: { en: 'Kamo River (Demachiyanagi)', ja: '鴨川（出町柳）' },
    area: { en: 'Kyoto', ja: '京都' },
    note: { en: 'Riverside path along the Kamo River', ja: '鴨川沿いの河川敷' },
    lat: 35.0303,
    lng: 135.772,
  },
  {
    id: 'meijo',
    name: { en: 'Meijo Park', ja: '名城公園' },
    area: { en: 'Nagoya', ja: '名古屋' },
    note: { en: 'Flat park loop north of Nagoya Castle', ja: '名古屋城の北、フラットな公園周回' },
    lat: 35.194,
    lng: 136.903,
  },
  {
    id: 'ohori',
    name: { en: 'Ohori Park', ja: '大濠公園' },
    area: { en: 'Fukuoka', ja: '福岡' },
    note: { en: 'About 2km loop around the pond', ja: '池を囲む1周約2km' },
    lat: 33.5862,
    lng: 130.3764,
  },
  {
    id: 'nakajima',
    name: { en: 'Nakajima Park', ja: '中島公園' },
    area: { en: 'Sapporo', ja: '札幌' },
    note: { en: 'Park loop near the Toyohira River', ja: '豊平川に近い公園の周回' },
    lat: 43.045,
    lng: 141.354,
  },
];
