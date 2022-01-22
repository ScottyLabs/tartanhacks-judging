import {
  Collapse,
  LinearProgress,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme, makeStyles } from "@mui/styles";
import { useRouter } from "next/dist/client/router";
import { ReactElement, useState } from "react";
import { useDispatch } from "react-redux";
import actions from "src/actions";
import ProjectButtons from "../design/ProjectButtons";

const useStyles = makeStyles((theme) => ({
  dialog: {
    display: "flex",
    // alignItems: "center",
    justifyContent: "center",
    width: "20%",
    padding: "1em",
    margin: "0 auto",
    textAlign: "center",
    radius: 25,
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      width: "80%",
    },
    [theme.breakpoints.down(theme.breakpoints.values.mobile)]: {
      width: "80%",
    },
    backgroundImage: `linear-gradient(180deg, #FFFFFF 85%, #FFE3E3 75.65%)`,
  },
  registrationForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    width: "100%",
  },
  header: {
    fontWeight: 600,
    backgroundImage: `linear-gradient(180deg, ${theme.palette.gradient.start} 19.64%, ${theme.palette.gradient.end} 69.64%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1em",
    position: "absolute",
  },
  titleRectangle : {
    width: "500px",
    height: "47px",
    left: "43px",
    top: "189px",
    background: "#F6C744",
    borderRadius: "10px",
  },
  switchAuth: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "1em",
  },
  link: {
    "&:hover": {
      textDecoration: "none",
      filter: "brightness(85%)",
    },
  },
  rectangle: {
    background: `linear-gradient(316.54deg, ${theme.palette.lightGradient.start} 35.13%, ${theme.palette.lightGradient.end} 126.39%)`,
    borderRadius: "1em",
    boxShadow: "0px 4px 4px rgba(200, 116, 56, 0.25)",
    color: theme.palette.text.primary,
    height: "500px",
    position: "relative",
    width: "100%",
    bottom: 0,
  },
}));

const ProjectDialog = ({
  registration = false,
}: {
  registration: boolean;
}): ReactElement => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const router = useRouter();
  const classes = useStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setLoading(true);
    try {
      await dispatch(actions.auth.register(email, password));
      router.push("/");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  const login = async () => {
    setLoading(true);
    try {
      await dispatch(actions.auth.login(email, password));
      router.push("/");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className={classes.dialog}>
      <Collapse in={loading}>
        <LinearProgress />
      </Collapse>
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="720"
          y1="407"
          x2="720"
          y2="-248"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={theme.palette.waveGradient.start} />
          <stop
            offset="1"
            stopColor={theme.palette.waveGradient.end}
            stopOpacity="0.88"
          />
        </linearGradient>
      </defs>
      <div className={classes.rectangle}>
      
      <form
        className={classes.registrationForm}
        onSubmit={(e) => {
          e.preventDefault();

          if (registration) {
            register();
          } else {
            login();
          }
        }}
      >
        <div className={classes.titleRectangle}>
        <Typography variant="h4" className={classes.header}>
          [Project Name Here]
        </Typography>
        </div>
        <Typography variant="h5">
          [Project Description]
        </Typography>
        <ProjectButtons />
      </form>
    </div>
    </div>
  );
};

export default ProjectDialog;
