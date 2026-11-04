import "./BalancedGrid.css";

/**
 * Menghitung pembagian baris proporsional tanpa kolom kosong (max 4 per baris)
 */
export function calculateRowDistribution(count) {
  if (count <= 0) return [];
  if (count === 1) return [1];
  if (count === 2) return [2];
  if (count === 3) return [3];
  if (count === 4) return [4];
  if (count === 5) return [3, 2];
  if (count === 6) return [3, 3];
  if (count === 7) return [4, 3];
  if (count === 8) return [4, 4];
  if (count === 9) return [3, 3, 3];
  if (count === 10) return [4, 3, 3];
  if (count === 11) return [4, 4, 3];
  if (count === 12) return [4, 4, 4];
  if (count === 13) return [4, 3, 3, 3];
  if (count === 14) return [4, 4, 3, 3];
  if (count === 15) return [4, 4, 4, 3];
  if (count === 16) return [4, 4, 4, 4];

  // Algoritma seimbang untuk count > 16 (maksimal 4 kolom per baris)
  const rows = [];
  let remaining = count;
  while (remaining > 0) {
    if (remaining >= 4 && remaining !== 5 && remaining !== 6 && remaining !== 7) {
      rows.push(4);
      remaining -= 4;
    } else if (remaining === 7) {
      rows.push(4, 3);
      remaining = 0;
    } else if (remaining === 6) {
      rows.push(3, 3);
      remaining = 0;
    } else if (remaining === 5) {
      rows.push(3, 2);
      remaining = 0;
    } else {
      rows.push(remaining);
      remaining = 0;
    }
  }
  return rows;
}

export function groupItemsIntoRows(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const distribution = calculateRowDistribution(items.length);
  const rows = [];
  let start = 0;
  for (const size of distribution) {
    rows.push(items.slice(start, start + size));
    start += size;
  }
  return rows;
}

export default function BalancedGrid({
  items = [],
  renderItem,
  className = "",
  gap = 24,
}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const rows = groupItemsIntoRows(items);

  return (
    <div
      className={`balanced-grid ${className}`.trim()}
      style={{ "--grid-gap": `${gap}px` }}
    >
      {rows.map((row, rowIndex) => (
        <div
          className="balanced-grid__row"
          key={`row-${rowIndex}-${row.length}`}
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
          }}
        >
          {row.map((item, itemIndex) => (
            <div className="balanced-grid__item" key={item?.id || item?.key || `item-${rowIndex}-${itemIndex}`}>
              {renderItem(item, itemIndex, row)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

