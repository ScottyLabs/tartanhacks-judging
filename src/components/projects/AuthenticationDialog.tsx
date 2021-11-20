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
import RoundedButton from "../design/RoundedButton";

const useStyles = makeStyles((theme) => ({
  dialog: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
    padding: "1em",
    margin: "0 auto",
    textAlign: "center",
    radius: 25,
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      width: "50%",
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
}));

const AuthenticationDialog = ({
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
      
        <Typography variant="h4" className={classes.header}>
          [Project Name Here]
        </Typography>
        <Typography variant="h5">
          [Project Description]
        </Typography>
        <RoundedButton type="submit">
          {registration ? "Demo" : "Login"}
        </RoundedButton>
        <RoundedButton type="submit">
          {registration ? "Contact" : "Login"}
        </RoundedButton>
      </form>
    </div>
  );
};

export default AuthenticationDialog;
