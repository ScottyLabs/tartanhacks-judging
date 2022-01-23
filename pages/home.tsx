import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { NextPage } from "next"
import React, { ReactElement, useEffect } from "react"
import WaveHeaderHomePage from "src/components/design/WaveHeaderHomePage"
import ScrollPrize from "src/components/home/ScrollPrize"

const WaveHeaderContainer = styled("div")({
  width: "100%",
  height: "75%",
  order: 0,
})

const SelectPrizeContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  order: 2,
  width: "100%",
  height: "5%",
  justifyContent: "center",
  alignContent: "center",
})

const ScrollPrizeContainer = styled("div")({
  alignSelf: "center",
  width: "100%",
  height: "100%",
  order: 3,
})

const TimerContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  order: 1,
  justifyContent: "center",
})

const HomePageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
})

const ArrowContainer1 = styled("div")({
  display: "flex",
  flexDirection: "row",
  order: 0,
  justifyContent: "center",
})

const ArrowContainer2 = styled("div")({
  display: "flex",
  flexDirection: "row",
  order: 2,
  justifyContent: "center",
})

const SelectPrizeArrow1 = styled("div")({
  position: "relative",
  width: "25px",
  height: "0px",
  top: "10%",

  boxSizing: "border-box",
  transform: "rotate(-180deg)",
  borderTop: "10px solid transparent",
  borderBottom: "10px solid transparent", 
  borderLeft: "10px solid #000000", 
})

const SelectPrizeBox1 = styled("div")({
  position: "relative",
  width: "25px",
  height: "5px",
  background: "black",
  top: "40%",
})

const SelectPrizeArrow2 = styled("div")({
  position: "relative",
  width: "10%",
  height: "0%",
  top: "10%",

  boxSizing: "border-box",
  borderTop: "10px solid transparent",
  borderBottom: "10px solid transparent", 
  borderLeft: "10px solid #000000", 
  order: 1,
})

const SelectPrizeBox2 = styled("div")({
  position: "relative",
  width: "25px",
  height: "5px",
  background: "black",
  top: "40%",
  order: 0,
})

const SelectPrizeText = styled("div")({
  width: "25em",
  height: "1.5em",
  fontFamily: "Poppins",
  fontStyle: "normal",
  textAlign: "center",
  color: "#000000",
  order: 1,
})

const HomePage: NextPage = (): ReactElement => {
  useEffect(() => {
    window.localStorage.removeItem("accessToken")
  }, [])
  return (
    <HomePageContainer>
      <WaveHeaderContainer>
        <WaveHeaderHomePage />
      </WaveHeaderContainer>
      <TimerContainer>
          <Typography variant="h2">
            COUNTDOWN TIMER GOES HERE
          </Typography> 
      </TimerContainer>
      <SelectPrizeContainer>
        <ArrowContainer1>
          <SelectPrizeArrow1/>
          <SelectPrizeBox1/>
        </ArrowContainer1>
        <SelectPrizeText>
          <Typography variant="body1">
            Swipe to select what prize you will be judging.
          </Typography> 
        </SelectPrizeText>
        <ArrowContainer2>
          <SelectPrizeArrow2/>
          <SelectPrizeBox2/>
        </ArrowContainer2>
      </SelectPrizeContainer>
      <ScrollPrizeContainer>
        <ScrollPrize />
      </ScrollPrizeContainer>
    </HomePageContainer>
  )
}

export default HomePage