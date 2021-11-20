import { Typography, useTheme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import React, { ReactElement } from "react"

const useStyles = makeStyles((theme) => ({
  waveContainer: {
    position: "absolute",
    width: "100%",
    overflow: "hidden",
    lineHeight: 0
  },
  title: {
    position: "absolute",
    zIndex: 1,
    color: "#AA5418",
    opacity: 0.6,
    marginLeft: "0.5em",
    marginTop: "0.5em",
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      marginLeft: "0.5em",
      marginTop: "0.5em",
      fontSize: "5em"
    },
    [theme.breakpoints.down(theme.breakpoints.values.mobile)]: {
      marginLeft: "0.7em",
      marginTop: "0.7em",
      fontSize: "3em"
    }
  },
  waveSvg: {
    position: "relative",
    width: "100%",
    height: "300px",
    filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))",
    [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
      height: "15em"
    },
    [theme.breakpoints.down(theme.breakpoints.values.mobile)]: {
      height: "10em"
    }
  }
}))

const WaveHeader = (): ReactElement => {
  const classes = useStyles()
  const theme = useTheme()
  return (
    <>
      <div className={classes.waveContainer}>
        <Typography variant="h1" className={classes.title}>
          JUDGING FOR:
        </Typography>
        <svg
          className={classes.waveSvg}
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
        >
          <path
            d="M1440 251.445C1337.08 331.37 1135.65 328.667 662.609 328.667C246.957 328.667 117.54 329.706 0 407L5.72619e-05 -248L1440 -248L1440 251.445Z"
            fill="url(#paint0_linear)"
          />
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
        </svg>
      </div>
    </>
  )
}

export default WaveHeader
