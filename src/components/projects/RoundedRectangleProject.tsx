import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement } from "react";

const useStyles = makeStyles((theme) => ({
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

const RoundedRectangleProject = (): ReactElement => {
  const classes = useStyles();
  return (
    <>
      {/* <Button className={classes.rectangle}>
      </Button> */}
    </>
  );
};

export default RoundedRectangleProject;
