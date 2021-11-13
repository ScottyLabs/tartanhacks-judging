import { useTheme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import React, { useEffect, useState  } from "react"

const useStyles = makeStyles((theme) => ({
    timerContainer: {
      display: "flex",
    },
    
    numberContainer:{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 60,
      width: 45,
      background: "#F7C062",
      borderRadius: 10,
      color: "#ffffff",
      fontSize: 28,
      fontWeight: 600
    },

    dayContainer:{
      width:60
    },

    daysText:{
      display: "flex",
      color: "#AA5418",
      fontSize: 24,
      fontWeight: 700,
      alignItems:"flex-end",
      marginLeft: 4,
      marginRight: 4,
    },

    divider:{
      display:"flex",
      alignItems:"center",
      fontSize:48,
      color:"#F7C062",
      height:60,
      marginLeft: 4,
      marginRight: 4,
    }

  }))

const CountdownTimer = (props) => {
    const classes = useStyles()
    const theme = useTheme()

    const calculateTimeLeft = () => {
        let year = new Date().getFullYear();
        let difference = +new Date(props.date) - +new Date();
        let timeLeft = {};
    
        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer=setTimeout(() => {
          setTimeLeft(calculateTimeLeft());
        }, 1000);
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer);
      });
    
        
    return (
        <div className={classes.timerContainer}>
          <div className={[classes.numberContainer, classes.dayContainer].join(" ")}>
            <span>{timeLeft.days}</span>
          </div>
          <div className={classes.daysText}>
            <span>DAYS</span>
          </div>
          <div className={classes.numberContainer}>
            <span>{timeLeft.hours}</span>
          </div>
          <div className={classes.divider}>:</div>
          <div className={classes.numberContainer}>
            <span>{timeLeft.minutes}</span>
          </div>
          <div className={classes.divider}>:</div>
          <div className={classes.numberContainer}>
            <span>{timeLeft.seconds}</span>
          </div>
        </div>
      );
    }
  
  export default CountdownTimer