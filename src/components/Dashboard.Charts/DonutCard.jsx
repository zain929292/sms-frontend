
import { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { CardShell, ChartBody } from "./CardShell";
import {
  COLORS,
  SIZES,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from "./ChartConstants";

const DonutCard = memo(
  ({ title, Icon, iconClass, data, size = "lg" }) => {
    const config = SIZES[size];

    return (
      <CardShell title={title} Icon={Icon} iconClass={iconClass}>
        <ChartBody heightClass={config.box}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={config.inner}
                outerRadius={config.outer}
                paddingAngle={config.gap}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  percent > 0.05
                    ? `${name} ${(percent * 100).toFixed(0)}%`
                    : null
                }
                labelLine={false}
                isAnimationActive={false}
                style={{ fontSize: 10 }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ fontSize: 11 }}
              />

              <Legend
                wrapperStyle={LEGEND_STYLE}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartBody>
      </CardShell>
    );
  }
);

DonutCard.displayName = "DonutCard";

export default DonutCard;
