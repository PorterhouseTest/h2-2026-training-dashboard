"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Point = Record<string, string | number | null>;

export function MileageChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#2B3038" vertical={false} />
          <XAxis dataKey="week" stroke="#A1A1AA" />
          <YAxis stroke="#A1A1AA" />
          <Tooltip contentStyle={{ background: "#171A1F", border: "1px solid #2B3038", color: "#FAFAFA" }} />
          <Bar dataKey="miles" fill="#9FDBA3" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({ data, dataKey, label }: { data: Point[]; dataKey: string; label: string }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#2B3038" vertical={false} />
          <XAxis dataKey="date" stroke="#A1A1AA" />
          <YAxis stroke="#A1A1AA" />
          <Tooltip contentStyle={{ background: "#171A1F", border: "1px solid #2B3038", color: "#FAFAFA" }} />
          <Line type="monotone" dataKey={dataKey} name={label} stroke="#7EA7D8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
