
import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { CardShell, ChartBody } from "./CardShell";
import { AXIS_TICK, TOOLTIP_STYLE } from "./ChartConstants";

const BarCard = memo(
  ({ title, Icon, iconClass, data, dataKey = "value", color }) => (
    <CardShell title={title} Icon={Icon} iconClass={iconClass}>
      <ChartBody heightClass="h-56 sm:h-64 lg:h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 4, left: -18 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />

            <XAxis
              dataKey="name"
              tick={AXIS_TICK}
              tickMargin={6}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={AXIS_TICK}
              tickMargin={6}
              width={34}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />

            <Tooltip contentStyle={TOOLTIP_STYLE} />

            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartBody>
    </CardShell>
  )
);

BarCard.displayName = "BarCard";

export default BarCard;
