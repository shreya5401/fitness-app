import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const Navbar = ({ onLogout }) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(23, 23, 23, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Typography
          sx={{
            fontFamily: "'Special Gothic Expanded One', sans-serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            color: "#FF5B93",
          }}
        >
          REPTRACK
        </Typography>
        <Button
          onClick={onLogout}
          sx={{
            color: "#ffffff",
            backgroundColor: "#D6336C",
            px: 3,
            "&:hover": { backgroundColor: "#FF5B93" },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
