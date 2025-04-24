import { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

export default function WordCloudChart({ data }) {
  const ref = useRef();

  function parseHeat(heatStr) {
    if (!heatStr) return 100;
    if (heatStr.endsWith("K+")) return parseFloat(heatStr) * 1000;
    if (heatStr.endsWith("M+")) return parseFloat(heatStr) * 1000000;
    if (heatStr.endsWith("+")) return parseFloat(heatStr);
    return parseFloat(heatStr) || 100;
  }

  useEffect(() => {
    if (!data || data.length === 0) return;
    console.log("WordCloud data:", data);
    console.log(data.length);

    const words = data.map((d) => ({
      text: d.title,
      size: parseHeat(d.heat) / 100, // 缩小尺度
      url: d.url,
    }));

    const layout = cloud()
      .size([600, 400])
      .words(words)
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : -45))
      .fontSize((d) => Math.max(14, Math.sqrt(d.size)))
      .on("end", draw);

    layout.start();

    function draw(words) {
      const svg = d3
        .select(ref.current)
        .html("") // 清空旧图
        .append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr(
          "transform",
          `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`
        );

      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d) => d.text)
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          if (d.url) window.open(d.url, "_blank");
        });
    }
  }, [data]);

  return <div ref={ref}></div>;
}
