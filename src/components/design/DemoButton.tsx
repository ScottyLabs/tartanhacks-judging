import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement } from "react";

const useStyles = makeStyles((theme) => ({
  button: {
    background: `linear-gradient(316.54deg, ${theme.palette.lightGradient.start} 35.13%, ${theme.palette.lightGradient.end} 126.39%)`,
    borderRadius: "1em",
    boxShadow: "0px 4px 4px rgba(200, 116, 56, 0.25)",
    color: theme.palette.text.primary,
    width: "137px",
    height: "47px",
    left: "61px",
    top: "347px",
  },
}));

const DemoButton = ({
  className,
  children,
  type,
}: {
  className?: string;
  children?: ReactElement | string;
  type: "button" | "reset" | "submit" | undefined;
}): ReactElement => {
  const classes = useStyles();
  return (
    <>
      <Button
        variant="contained"
        type={type}
        className={`${className} ${classes.button}`}
      >
        {children}
      </Button>
    </>
  );
};

export default DemoButton;
