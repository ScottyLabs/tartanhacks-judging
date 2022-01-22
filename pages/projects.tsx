import { makeStyles } from "@mui/styles"
import { NextPage } from "next"
import React, { ReactElement } from "react"
import ProjectDialog from "src/components/projects/ProjectDialog"
import WaveHeader from "src/components/projects/WaveHeader"
import RoundedRectangleProject from "src/components/projects/RoundedRectangleProject"

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "10em",
    boxSizing: "border-box",
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      paddingTop: "3em"
    }
  },
  scottyContainer: {
    zIndex: -1,
    opacity: 0.3,
    bottom: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "end"
  },
  scottyIcon: {
    position: "relative",
    width: "50%",
    bottom: 0,
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      width: "100%"
    }
  }
}))

const RegisterPage: NextPage = (): ReactElement => {
  const classes = useStyles()
  return (
    <div>
      <WaveHeader />
      <div className={classes.scottyContainer}>
      </div>
      <RoundedRectangleProject />
      <div className={classes.dialog}>
        <ProjectDialog registration={true} />
      </div>
      <div className={classes.dialog}>
        <ProjectDialog registration={true} />
      </div>
    </div>
  )
}

export default RegisterPage
