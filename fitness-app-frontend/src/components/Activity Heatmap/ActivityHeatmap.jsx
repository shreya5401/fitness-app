import { useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./ActivityHeatmap.css";
import { Box, Typography, IconButton } from "@mui/material";

const toDateKey = (isoString) => isoString.split("T")[0];

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

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const values = Object.entries(countsByDate).map(([date, count]) => ({ date, count }));

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
        titleForValue={(value) =>
          value && value.count
            ? `${value.count} workout${value.count > 1 ? "s" : ""} on ${value.date}`
            : "No workout"
        }
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
