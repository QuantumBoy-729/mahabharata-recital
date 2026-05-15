export interface ParvaMeta {
  /** 1-indexed book number (matches sacred-texts.com /hin/m{NN}/ folder). */
  number: number;
  /** Folder slug as used on sacred-texts.com (e.g. "m01"). */
  slug: string;
  /** English/Anglicized name. */
  name: string;
  /** Sanskrit name in Devanagari. */
  sanskrit: string;
  /** Short, readable description of what this book covers. */
  summary: string;
  /** Total number of sections (chapters) in the KMG translation. */
  sectionCount: number;
}

/**
 * The 18 parvas (books) of the Mahabharata, in canonical order.
 *
 * Section counts reflect the Kisari Mohan Ganguli (KMG) English translation
 * as hosted on sacred-texts.com (https://sacred-texts.com/hin/maha/index.htm).
 */
export const PARVAS: ParvaMeta[] = [
  {
    number: 1,
    slug: 'm01',
    name: 'Adi Parva',
    sanskrit: 'आदि पर्व',
    summary:
      'The Book of the Beginning. Origins of the Bharata lineage, the births of the Kuru and Pandava princes, the burning of the lac house, and Draupadi\u2019s svayamvara.',
    sectionCount: 236,
  },
  {
    number: 2,
    slug: 'm02',
    name: 'Sabha Parva',
    sanskrit: 'सभा पर्व',
    summary:
      'The Book of the Assembly Hall. Yudhishthira\u2019s Rajasuya sacrifice, the fateful game of dice, Draupadi\u2019s humiliation, and the Pandavas\u2019 exile.',
    sectionCount: 80,
  },
  {
    number: 3,
    slug: 'm03',
    name: 'Vana Parva',
    sanskrit: 'वन पर्व',
    summary:
      'The Book of the Forest. The twelve years of forest exile \u2014 pilgrimages, sages\u2019 tales (including Nala, Savitri, and Rama), and Arjuna\u2019s quest for divine weapons.',
    sectionCount: 313,
  },
  {
    number: 4,
    slug: 'm04',
    name: 'Virata Parva',
    sanskrit: 'विराट पर्व',
    summary:
      'The Book of Virata. The thirteenth year of exile spent in disguise at King Virata\u2019s court; Arjuna repels a Kaurava cattle raid as Brihannala.',
    sectionCount: 72,
  },
  {
    number: 5,
    slug: 'm05',
    name: 'Udyoga Parva',
    sanskrit: 'उद्योग पर्व',
    summary:
      'The Book of Effort. Both sides marshal allies; Krishna\u2019s peace embassy fails; Bhishma is named commander as war becomes inevitable.',
    sectionCount: 197,
  },
  {
    number: 6,
    slug: 'm06',
    name: 'Bhishma Parva',
    sanskrit: 'भीष्म पर्व',
    summary:
      'The Book of Bhishma. The Kurukshetra war begins. Includes the Bhagavad Gita \u2014 Krishna\u2019s discourse to Arjuna \u2014 and ten days of Bhishma\u2019s command.',
    sectionCount: 117,
  },
  {
    number: 7,
    slug: 'm07',
    name: 'Drona Parva',
    sanskrit: 'द्रोण पर्व',
    summary:
      'The Book of Drona. The acharya Drona leads the Kaurava army; Abhimanyu falls inside the chakravyuha; Jayadratha is slain at sunset.',
    sectionCount: 202,
  },
  {
    number: 8,
    slug: 'm08',
    name: 'Karna Parva',
    sanskrit: 'कर्ण पर्व',
    summary:
      'The Book of Karna. Karna becomes commander; Shalya is his charioteer. The long-foretold duel with Arjuna ends with Karna\u2019s death.',
    sectionCount: 96,
  },
  {
    number: 9,
    slug: 'm09',
    name: 'Shalya Parva',
    sanskrit: 'शल्य पर्व',
    summary:
      'The Book of Shalya. The eighteenth and final day of war: Shalya falls, the Kaurava army is broken, and Bhima slays Duryodhana with a mace.',
    sectionCount: 65,
  },
  {
    number: 10,
    slug: 'm10',
    name: 'Sauptika Parva',
    sanskrit: 'सौप्तिक पर्व',
    summary:
      'The Book of the Sleeping Warriors. Ashwatthama\u2019s night raid massacres the Pandava camp; Krishna curses him to wander for three thousand years.',
    sectionCount: 18,
  },
  {
    number: 11,
    slug: 'm11',
    name: 'Stri Parva',
    sanskrit: 'स्त्री पर्व',
    summary:
      'The Book of the Women. Gandhari, Kunti, and the women of both houses lament on the battlefield; Gandhari curses Krishna.',
    sectionCount: 27,
  },
  {
    number: 12,
    slug: 'm12',
    name: 'Shanti Parva',
    sanskrit: 'शान्ति पर्व',
    summary:
      'The Book of Peace. Yudhishthira is consoled by Bhishma on his arrow-bed; long discourses on dharma, statecraft, and liberation.',
    sectionCount: 365,
  },
  {
    number: 13,
    slug: 'm13',
    name: 'Anushasana Parva',
    sanskrit: 'अनुशासन पर्व',
    summary:
      'The Book of the Instructions. Bhishma\u2019s final teachings on duty, charity, and devotion; he then chooses to die.',
    sectionCount: 168,
  },
  {
    number: 14,
    slug: 'm14',
    name: 'Ashvamedhika Parva',
    sanskrit: 'अश्वमेधिक पर्व',
    summary:
      'The Book of the Horse Sacrifice. Yudhishthira performs the Ashvamedha; Arjuna follows the consecrated horse and battles former allies and sons.',
    sectionCount: 96,
  },
  {
    number: 15,
    slug: 'm15',
    name: 'Ashramavasika Parva',
    sanskrit: 'आश्रमवासिक पर्व',
    summary:
      'The Book of the Hermitage. Dhritarashtra, Gandhari, and Kunti retire to the forest and perish in a wildfire.',
    sectionCount: 39,
  },
  {
    number: 16,
    slug: 'm16',
    name: 'Mausala Parva',
    sanskrit: 'मौसल पर्व',
    summary:
      'The Book of the Clubs. The Yadavas destroy themselves in a drunken brawl; Krishna and Balarama leave the world; Dwaraka sinks into the sea.',
    sectionCount: 9,
  },
  {
    number: 17,
    slug: 'm17',
    name: 'Mahaprasthanika Parva',
    sanskrit: 'महाप्रस्थानिक पर्व',
    summary:
      'The Book of the Great Journey. The Pandavas and Draupadi set out for the Himalayas; one by one they fall, leaving only Yudhishthira and a dog.',
    sectionCount: 3,
  },
  {
    number: 18,
    slug: 'm18',
    name: 'Svargarohanika Parva',
    sanskrit: 'स्वर्गारोहणिक पर्व',
    summary:
      'The Book of the Ascent to Heaven. Yudhishthira\u2019s test at the gates of Svarga, his vision of hell and heaven, and the epic\u2019s closing.',
    sectionCount: 5,
  },
];

export function getParva(number: number): ParvaMeta | undefined {
  return PARVAS.find((p) => p.number === number);
}

/** Total section count across all 18 parvas (KMG translation). */
export const TOTAL_SECTIONS = PARVAS.reduce((sum, p) => sum + p.sectionCount, 0);
