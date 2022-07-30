import { styled } from "@mui/material/styles"
import { NextPage } from "next"
import React, { ReactElement, useEffect } from "react"
import ScottyLabsIcon from "src/components/design/ScottyLabsIcon"
import WaveHeader from "src/components/design/WaveHeader"

const ScottyContainer = styled("div")({
  zIndex: -1,
  opacity: 0.3,
  bottom: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  display: "flex",
  justifyContent: "center",
  alignItems: "end"
})

const ScottyIcon = styled(ScottyLabsIcon)(({ theme }) => ({
  position: "relative",
  width: "40%",
  bottom: 0,
  [theme.breakpoints.down(theme.breakpoints.values.tablet)]: {
    width: "100%"
  }
}))

const JudgePage: NextPage = (): ReactElement => {
  return (
    <div>
      <WaveHeader />
      <ScottyContainer>
        <ScottyIcon />
      </ScottyContainer>
    </div>
  )
}

export default JudgePage
