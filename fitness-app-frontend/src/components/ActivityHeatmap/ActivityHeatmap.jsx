import { useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./ActivityHeatmap.css";
import { Box, Typography, IconButton } from "@mui/material";

const toDateKey = (isoString) => isoString.split("T")[0];

const pad = (n) => String(n).padStart(2, "0");
const formatDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const ActivityHeatmap = ({ activities = [], onDateClick }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const countsByDate = useMemo(() => {
    const counts = {};
    activities.forEach((activity) => {
      const raw = activity.startTime || activity.createdAt;
      if (!raw) return;
      const key = toDateKey(raw);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [activities]);

  const startDate = useMemo(() => new Date(year, 0, 1), [year]);
  const endDate = useMemo(() => new Date(year, 11, 31), [year]);

  const values = useMemo(() => {
    const days = [];
    for (const cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
      const key = formatDateKey(cursor);
      days.push({ date: key, count: countsByDate[key] || 0 });
    }
    return days;
  }, [countsByDate, startDate, endDate]);

  return (
    <Box
      className="activity-heatmap"
      sx={{
        backgroundColor: "#1f1f1f",
        border: "1px solid #2a2a2a",
        borderRadius: "16px",
        p: { xs: 2, md: 3 },
        mb: 4,
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ color: "#ffffff", fontWeight: 600, fontSize: "1.05rem" }}>
          Workout Consistency
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setYear((prev) => prev - 1)}
            sx={{ color: "#FF5B93" }}
            aria-label="Previous year"
          >
            &#8249;
          </IconButton>
          <Typography sx={{ color: "#FFB6C1", fontSize: "0.85rem", minWidth: 60, textAlign: "center" }}>
            {year}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setYear((prev) => Math.min(currentYear, prev + 1))}
            disabled={year === currentYear}
            sx={{ color: "#FF5B93" }}
            aria-label="Next year"
          >
            &#8250;
          </IconButton>
        </Box>
      </Box>

      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        showWeekdayLabels
        gutterSize={2}
        classForValue={(value) => (value && value.count ? "color-filled" : "color-empty")}
        titleForValue={(value) => {
          if (!value || !value.date) return "";
          const label = new Date(`${value.date}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return value.count
            ? `${value.count} workout${value.count > 1 ? "s" : ""} on ${label}`
            : `No workout on ${label}`;
        }}
        onClick={(value) => {
          if (value && value.date && onDateClick) {
            onDateClick(value.date);
          }
        }}
      />
    </Box>
  );
};

export default ActivityHeatmap;
