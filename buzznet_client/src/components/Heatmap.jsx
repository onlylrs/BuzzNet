export default function Heatmap({ items, timer }) {
    const max = Math.max(...items.map(i => i.heat));
    const min = Math.min(...items.map(i => i.heat));
  
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-orange-500">🔥</span>
          <span className="text-sm text-gray-600">Heatmap (heat update every {timer}s)</span>
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
          {items.map((item, i) => {
            const normalized = (item.heat - min) / (max - min);
            const color = getHeatColor(normalized);
            return (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.title} 🔥 ${item.heat}`}
                className="h-4 rounded-sm"
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>
    );
  }
  
  function getHeatColor(v) {
    if (v > 0.99) return "#fe0000";
    if (v > 0.9) return "#ff2b25";
    if (v > 0.8) return "#ef4444"; // red
    if (v > 0.7) return "#ff9489"; 
    if (v > 0.6) return "#f97316"; // orange
    if (v > 0.5) return "#ffcf89";
    if (v > 0.4) return "#facc15"; // yellow
    if (v > 0.3) return "#f6ff89";
    if (v > 0.2) return "#fde26a"; 
    if (v > 0.1) return "#c0ff89"
    return "#deffd4";
  }
  