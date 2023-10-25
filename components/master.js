import React, { useState } from "react";
import Fade from 'react-bootstrap/Fade';
import FileUpload from "@/components/fileUpload";
import ErrorCatch from "@/components/errorCatch";
import GetParams from "@/components/getParams";
import ProcessData from "@/components/processData";
import DisplayResults from "@/components/displayResults";

export default function Master() {
  const [inputData, setInputData] = useState({
    data: [],
    errors: [],
    meta: [],
  });
  const [finalTeams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [numTeams, setNumTeams] = useState();
  const [step, setStep] = useState("file");
  const [errMsg, setErrMsg] = useState("");

  const updateInputData = (results) => {
    setInputData((previousState) => {
      return { ...previousState, data: results.data };
    });
  };

  const updateTeams = (teams) => setTeams(teams);
  const updateNumTeams = (value) => setNumTeams(value);
  const updateRankings = (ranks) => setRankings(ranks);
  const jumpTo = (nextStage) => setStep(nextStage);
  const catchError = (nextStage, error) => {
    setStep(nextStage);
    setErrMsg(error);
  };

  return (
  <div>
    <Fade in={step == 'file'}>
      {step == 'file' ? 
      <div>
         <FileUpload updateInputData={updateInputData} jumpTo={jumpTo}/>
      </div> : <span></span>}
    </Fade>
    <Fade in={step == 'params'}>
      {step == 'params' ?
      <div>
        <GetParams
          dataLen={inputData.data.length}
          updateNumTeams={updateNumTeams}
          updateRankings={updateRankings}
          jumpTo={jumpTo}
        />
      </div> : <span></span>}
    </Fade>
    <Fade in={step == 'process'}>
      {step == 'process' ? 
      <div>
        <ProcessData
            inputData={inputData}
            numTeams={numTeams}
            rankings={rankings}
            updateTeams={updateTeams}
            jumpTo={jumpTo}
            catchError={catchError}
          />
      </div> : <span></span>}
    </Fade>
    <Fade in={step == 'display'}>
      {step == 'display' ? 
      <div>
        <DisplayResults inputData={finalTeams} jumpTo={jumpTo} />
      </div> : <span></span>}
    </Fade>
    <Fade in={step == 'error'}>
      {step == 'error' ? 
      <div>
        <ErrorCatch jumpTo={jumpTo} category={errMsg} />
      </div> : <span></span>}
    </Fade>
  </div>);
}
