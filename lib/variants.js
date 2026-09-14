// Item lama cuma punya `price` tunggal. Item baru bisa punya `variants`
// (array {label, price}) untuk kasus seperti Frozen/Goreng atau Isi 3/Isi 5.
// Kedua bentuk hidup berdampingan — helper ini yang memutuskan mana yang dipakai.

export const getItemVariants = (item) =>
  Array.isArray(item?.variants)
    ? item.variants.filter(
        (v) => v && v.label && Number.isFinite(Number(v.price)) && Number(v.price) > 0,
      )
    : [];

export const getVariantPriceRange = (variants) => {
  if (!variants.length) return null;
  const prices = variants.map((v) => Number(v.price));
  return { min: Math.min(...prices), max: Math.max(...prices) };
};
