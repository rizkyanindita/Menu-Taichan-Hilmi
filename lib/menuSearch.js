// Pencarian menu: dibuat terpisah dari komponen supaya logika ranking bisa
// diuji/di-tweak tanpa menyentuh UI.
//
// Tiga hal yang bikin hasilnya akurat untuk menu kafe Indonesia:
//   1. Normalisasi — "Es Kopi Susu!" == "es kopi susu", tanda baca & aksen dibuang.
//   2. Semua kata query harus ketemu (AND), bukan OR — "kopi susu" tidak boleh
//      memunculkan semua item yang cuma punya kata "susu".
//   3. Toleransi typo terbatas (edit distance) + sinonim, tapi skornya selalu
//      lebih rendah dari kecocokan persis supaya urutan tetap masuk akal.

export const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const tokenize = (value) => normalize(value).split(" ").filter(Boolean);

// Kata yang sering ditulis berbeda oleh pelanggan vs yang tertulis di menu.
const SYNONYM_GROUPS = [
  ["es", "ice", "dingin", "cold"],
  ["panas", "hot", "anget", "hangat"],
  ["kopi", "coffee", "koffie"],
  ["susu", "milk", "latte"],
  ["teh", "tea"],
  ["jus", "juice"],
  ["mie", "mi", "mee", "noodle", "noodles"],
  ["nasi", "rice"],
  ["ayam", "chicken"],
  ["sapi", "beef"],
  ["udang", "shrimp"],
  ["goreng", "fried", "crispy"],
  ["bakar", "panggang", "grill", "grilled"],
  ["pedas", "pedes", "spicy", "hot"],
  ["manis", "sweet"],
  ["minum", "minuman", "drink", "drinks", "beverage"],
  ["makan", "makanan", "food", "meal"],
  ["camilan", "cemilan", "snack", "snacks"],
  ["paket", "combo", "bundle", "hemat"],
  ["keju", "cheese"],
  ["coklat", "cokelat", "chocolate", "choco"],
  ["gula", "sugar"],
  ["telur", "telor", "egg"],
];

const SYNONYMS = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    const existing = SYNONYMS.get(word) || [];
    SYNONYMS.set(word, [...new Set([...existing, ...group.filter((w) => w !== word)])]);
  }
}

// "15k" / "15rb" / "15 ribu" -> 15000, supaya cari harga ikut kena.
const parsePriceToken = (token) => {
  const shorthand = token.match(/^(\d+)(k|rb|ribu)$/);
  if (shorthand) return String(parseInt(shorthand[1], 10) * 1000);
  if (/^\d+$/.test(token)) return token;
  return null;
};

// Damerau–Levenshtein dengan batas atas: begitu semua sel di satu baris sudah
// melewati `max`, tidak ada gunanya melanjutkan.
const boundedDistance = (a, b, max) => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prev2 = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const row = new Array(b.length + 1);
    row[0] = i;
    let rowMin = row[0];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      // transposisi: "kpoi" -> "kopi"
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prev2[j - 2] + 1);
      }
      row[j] = value;
      if (value < rowMin) rowMin = value;
    }

    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = row;
  }

  return prev[b.length];
};

// Kata pendek tidak boleh fuzzy — "es" vs "as" vs "ok" jarak 1 semua,
// hasilnya jadi berisik.
const maxTypos = (token) => {
  if (token.length <= 3) return 0;
  if (token.length <= 6) return 1;
  return 2;
};

const WEIGHTS = {
  name: { exact: 100, prefix: 85, contains: 62, fuzzy: 58 },
  category: { exact: 55, prefix: 48, contains: 36, fuzzy: 30 },
  description: { exact: 34, prefix: 28, contains: 20, fuzzy: 15 },
  unit: { exact: 26, prefix: 20, contains: 14, fuzzy: 0 },
};

const scoreWords = (words, token, weights) => {
  let best = 0;
  for (const word of words) {
    if (word === token) return weights.exact;
    if (word.startsWith(token)) best = Math.max(best, weights.prefix);
    // Cocok di tengah kata hanya untuk token >= 3 huruf: kalau tidak, "es"
    // ikut menarik "sp-es-ial", "k-es" — mirip tapi bukan yang dicari.
    else if (token.length >= 3 && word.includes(token)) best = Math.max(best, weights.contains);
  }
  if (best > 0 || weights.fuzzy === 0) return best;

  const limit = maxTypos(token);
  if (limit === 0) return 0;
  for (const word of words) {
    // beda panjang terlalu jauh: bukan typo, memang kata lain
    if (Math.abs(word.length - token.length) > limit) continue;
    const distance = boundedDistance(word, token, limit);
    if (distance <= limit) best = Math.max(best, weights.fuzzy - distance * 14);
  }
  return best;
};

const scoreTokenAgainstItem = (token, fields) => {
  let best = 0;
  best = Math.max(best, scoreWords(fields.nameWords, token, WEIGHTS.name));
  if (best >= WEIGHTS.name.exact) return best;
  best = Math.max(best, scoreWords(fields.categoryWords, token, WEIGHTS.category));
  best = Math.max(best, scoreWords(fields.descriptionWords, token, WEIGHTS.description));
  best = Math.max(best, scoreWords(fields.unitWords, token, WEIGHTS.unit));

  const priceToken = parsePriceToken(token);
  if (priceToken && fields.price) {
    if (fields.price === priceToken) best = Math.max(best, 70);
    else if (fields.price.startsWith(priceToken)) best = Math.max(best, 45);
    else if (fields.price.includes(priceToken)) best = Math.max(best, 28);
  }

  return best;
};

const buildFields = (item) => {
  const name = normalize(item.name);
  const category = normalize(item.category);
  const description = normalize(item.description);
  return {
    name,
    nameWords: name.split(" ").filter(Boolean),
    categoryWords: category.split(" ").filter(Boolean),
    descriptionWords: description.split(" ").filter(Boolean),
    unitWords: normalize(item.unit).split(" ").filter(Boolean),
    price: String(item.price ?? "").replace(/\D/g, ""),
  };
};

// Pelanggan sering mengetik tanpa spasi di keyboard HP ("kopisusu",
// "ayamgeprek"). Bandingkan versi rapat dari query dengan nama item.
const compactScore = (fields, phrase, item) => {
  const compactPhrase = phrase.replace(/ /g, "");
  if (compactPhrase.length < 4) return 0;
  const compactName = fields.name.replace(/ /g, "");
  if (compactName === compactPhrase) return item.isSoldOut ? 45 : 90;
  if (compactName.startsWith(compactPhrase)) return item.isSoldOut ? 30 : 75;
  if (compactName.includes(compactPhrase)) return item.isSoldOut ? 15 : 60;
  return 0;
};

const scoreItem = (item, tokens, phrase) => {
  const fields = buildFields(item);
  let total = 0;

  for (const token of tokens) {
    let best = scoreTokenAgainstItem(token, fields);

    // Sinonim dihargai lebih rendah supaya kecocokan harfiah selalu di atas.
    // Token 1-2 huruf tidak diperluas — "es" -> "dingin" bikin hasil melebar
    // jauh dari yang diketik.
    if (best < WEIGHTS.name.prefix && token.length >= 3) {
      for (const alt of SYNONYMS.get(token) || []) {
        best = Math.max(best, scoreTokenAgainstItem(alt, fields) * 0.7);
        if (best >= WEIGHTS.name.prefix) break;
      }
    }

    // Satu kata saja tidak ketemu -> item dibuang (AND, bukan OR), kecuali
    // query ternyata nama yang ditulis tanpa spasi ("kopisusu").
    if (best <= 0) return compactScore(fields, phrase, item);
    total += best;
  }

  // Bonus frasa utuh: "kopi susu" harus menang atas "susu kopi jahe".
  if (phrase.includes(" ") && fields.name.includes(phrase)) {
    total += fields.name.startsWith(phrase) ? 70 : 45;
  }
  if (tokens.length > 1) {
    const allInName = tokens.every((t) => scoreWords(fields.nameWords, t, WEIGHTS.name) > 0);
    if (allInName) total += 30;
  }
  if (item.isSoldOut) total -= 45; // tetap muncul, tapi di bawah yang tersedia

  return Math.max(total, 1);
};

/**
 * Kembalikan item yang cocok, terurut dari paling relevan.
 * Query kosong -> semua item, urutan asli.
 */
export const searchMenuItems = (items = [], query = "") => {
  const phrase = normalize(query);
  if (!phrase) return items;

  const tokens = phrase.split(" ").filter(Boolean);

  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, tokens, phrase) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        // skor imbang: nama lebih pendek biasanya yang dimaksud ("Kopi Susu"
        // sebelum "Kopi Susu Gula Aren Extra Shot"), lalu urutan asli menu.
        a.item.name.length - b.item.name.length ||
        a.index - b.index,
    )
    .map((entry) => entry.item);
};

/**
 * Pecah teks jadi potongan {text, match} untuk highlight di UI.
 * Hanya menyorot kecocokan harfiah — hasil fuzzy/sinonim sengaja tidak disorot
 * supaya tidak menandai kata yang tidak diketik pengguna.
 */
export const highlightParts = (text, tokens = []) => {
  const source = String(text ?? "");
  if (!source || tokens.length === 0) return [{ text: source, match: false }];

  const escaped = tokens
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (escaped.length === 0) return [{ text: source, match: false }];

  const parts = [];
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: source.slice(lastIndex, match.index), match: false });
    }
    parts.push({ text: match[0], match: true });
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) regex.lastIndex += 1; // jaga-jaga dari loop tak berujung
  }
  if (lastIndex < source.length) {
    parts.push({ text: source.slice(lastIndex), match: false });
  }
  return parts;
};
