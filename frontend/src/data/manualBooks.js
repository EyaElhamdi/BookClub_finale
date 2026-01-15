// Store image filenames as strings - they'll be loaded dynamically in components
const imgPetitPrince = "images.jpg";
const imgEtranger = "9782070360024_1_75_2.jpg";
const img1984 = "602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif";
const imgCandide = "images1.jpg";
const imgPeste = "9782701161662_1_75.jpg";
const imgAr1 = "ara1.jfif";
const imgAr2 = "ara2.jfif";
const imgAr3 = "ara3.jfif";
const imgAr4 = "ara4.jfif";
const imgAr5 = "ara5.jpg";

const manualBooks = [
  {
    _id: "m1",
    title: "Le Petit Prince",
    author: "A. de Saint-Exupéry",
    rating: 5,
    image: imgPetitPrince,
    year: 1943,
    language: "fr",
    teaser:
      "Le Petit Prince est un conte qui mêle poésie, philosophie et critique sociale. À travers la rencontre entre un aviateur perdu dans le désert et un petit prince venu d’une autre planète, Saint Exupéry propose une réflexion profonde sur la nature humaine.",
    characters: [{ name: "Le Petit Prince" }, { name: "Le Pilote" }],
    buyLink: "https://fr.wikipedia.org/wiki/Le_Petit_Prince",
    excerpt: `Chapitre I
Quand j'avais six ans j'ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge, qui s'appelait "Véritables Histoires de la Forêt".`,
  },
  {
    _id: "m2",
    title: "L'Étranger",
    author: "Albert Camus",
    rating: 4.5,
    image: imgEtranger,
    year: 1942,
    language: "fr",
    teaser:
      "L’Étranger, publié en 1942, est l’un des romans les plus étudiés au lycée et une œuvre clé du bac de français. À travers le personnage de Meursault, Camus explore la philosophie de l’absurde et interroge le rapport de l’homme au monde, à la justice et à la mort.",
    characters: [{ name: "Meursault" }],
    buyLink: "https://fr.wikipedia.org/wiki/L%27%C3%89tranger",
    excerpt: `Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.`,
  },
  {
    _id: "m3",
    title: "1984",
    author: "George Orwell",
    rating: 5,
    image: img1984,
    year: 1949,
    language: "en",
    teaser:
      "Publié en 1949, 1984 de George Orwell est un roman de science-fiction qui imagine une société totalitaire extrême. L’œuvre est rapidement devenue un classique, étudié pour sa portée politique et sa réflexion sur la liberté.",
    characters: [{ name: "Winston Smith" }, { name: "Julia" }],
    buyLink: "https://fr.wikipedia.org/wiki/1984_(roman)",
    excerpt: `Il y avait une fois, dans une ville surveillée par des affiches, un homme qui commença à écrire des pensées interdites.`,
  },
  {
    _id: "m4",
    title: "Candide",
    author: "Voltaire",
    rating: 4,
    image: imgCandide,
    year: 1759,
    language: "fr",
    teaser:
      "Cette œuvre majeure des Lumières est une critique mordante de l'optimisme leibnizien, selon lequel nous vivrions dans « le meilleur des mondes possibles ». À travers les aventures rocambolesques de son héros naïf, Voltaire dénonce les injustices et les absurdités du monde tout en proposant une réflexion sur le bonheur et le sens de la vie.",
    characters: [{ name: "Candide" }],
    buyLink: "https://fr.wikipedia.org/wiki/Candide",
    excerpt: `Candide était un jeune homme simple, élevé dans un château, qui connut de nombreux malheurs et aventures.`,
  },
  {
    _id: "m5",
    title: "La Peste",
    author: "Albert Camus",
    rating: 4,
    image: imgPeste,
    year: 1947,
    language: "fr",
    teaser:
      "Publié en 1947, La Peste est un roman majeur d’Albert Camus. L’œuvre met en scène la ville d’Oran, frappée par une épidémie dévastatrice. À travers cette histoire, Camus interroge la condition humaine, la solidarité et la révolte face à l’absurdité de la vie.",
    characters: [{ name: "Rieux" }, { name: "Tarrou" }],
    buyLink: "https://fr.wikipedia.org/wiki/La_Peste_(roman)",
    excerpt: `Le docteur Rieux se souvint des premiers signes de la peste : fièvres, invraisemblables maux et la lente angoisse qui envahit la ville.`,
  },
  {
    _id: "m6",
    title: "ألف ليلة وليلة",
    author: "مجموعة",
    rating: 4.8,
    image: imgAr1,
    year: null,
    teaser: "مجموعة قصصية تراثية معروفة أيضاً بليالي العرب حيث تحكي شهرزاد قصصها للحفاظ على حياتها.",
    characters: [{ name: "شهرزاد" }],
    buyLink: "https://ar.wikipedia.org/wiki/%D8%A3%D9%84%D9%81_%D9%84%D9%8A%D9%84%D8%A9_%D9%88%D9%84%D9%8A%D9%84%D8%A9",
    excerpt: `كانت شهرزاد تحكي القصص ليلاً لتحيى، ولتتوالى الليالي وقد امتدت الحكايات عبر البحار.`,
    language: "ar",
    rtl: true,
  },
  {
    _id: "m7",
    title: "موسم الهجرة إلى الشمال",
    author: "الطيب صالح",
    rating: 4.6,
    image: imgAr2,
    year: 1966,
    teaser: "رواية سودانية تتناول الهوية والصراع بين الشرق والغرب من خلال شخصية مصطفى سعيد.",
    characters: [{ name: "مصطفى سعيد" }],
    buyLink: "https://ar.wikipedia.org/wiki/%D9%85%D9%88%D8%B3%D9%85_%D8%A7%D9%84%D9%87%D8%AC%D8%B1%D8%A9_%D8%A5%D9%84%D9%89_%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D9%84",
    excerpt: `ليالي وذكريات ترتبط بعودة الراوي إلى قريته واكتشافه قصة مصطفى سعيد.`,
    language: "ar",
    rtl: true,
  },
  {
    _id: "m8",
    title: "الخبز الحافي",
    author: "محمد شكري",
    rating: 4.4,
    image: imgAr3,
    year: 1973,
    teaser: "سيرة ذاتية صادمة تقدم صورة عن الفقر والاغتراب في المغرب.",
    characters: [{ name: "الراوي" }],
    buyLink: "https://ar.wikipedia.org/wiki/%D8%A7%D9%84%D8%AE%D8%A8%D8%B2_%D8%A7%D9%84%D8%AD%D8%A7%D9%81%D9%8A",
    excerpt: `طفولة قاسية واشتياق للناس والحياة في صفحات حافلة بالألم والصدق.`,
    language: "ar",
    rtl: true,
  },
  {
    _id: "m9",
    title: "رجال في الشمس",
    author: "غسان كنفاني",
    rating: 4.3,
    image: imgAr4,
    year: 1963,
    teaser: "رواية قصيرة تتناول معاناة الفلسطينيين واللجوء عن طريق ثلاث شخصيات تسعى للهجرة.",
    characters: [{ name: "أبو علي" }],
    buyLink: "https://ar.wikipedia.org/wiki/%D8%B1%D8%AC%D8%A7%D9%84_%D9%81%D9%8A_%D8%A7%D9%84%D8%B4%D9%85%D8%B3",
    excerpt: `تجربة مؤلمة تؤكد هشاشة الحياة والآمال المكسورة.`,
    language: "ar",
    rtl: true,
  },
  {
    _id: "m10",
    title: "ذاكرة الجسد",
    author: "أحلام مستغانمي",
    rating: 4.2,
    image: imgAr5,
    year: 1993,
    teaser: "رواية معاصرة تتناول الحب والذاكرة والهوية في الجزائر وما بعدها.",
    characters: [{ name: "جميلة" }],
    buyLink: "https://ar.wikipedia.org/wiki/%D8%B0%D8%A7%D9%83%D8%B1%D8%A9_%D8%A7%D9%84%D8%AC%D8%B3%D8%AF",
    excerpt: `ذاكرة تنبض بالعواطف، وحب يتجاوز الجراح.`,
    language: "ar",
    rtl: true,
  },
];

export default manualBooks;
