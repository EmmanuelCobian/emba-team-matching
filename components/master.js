import React, { useState } from "react";
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

  function handleChange() {
    switch (step) {
      case "file":
        return <FileUpload updateInputData={updateInputData} jumpTo={jumpTo} />;
      case "params":
        return (
          <GetParams
            dataLen={inputData.data.length}
            updateNumTeams={updateNumTeams}
            updateRankings={updateRankings}
            jumpTo={jumpTo}
          />
        );
      case "process":
        return (
          <ProcessData
            inputData={inputData}
            numTeams={numTeams}
            rankings={rankings}
            updateTeams={updateTeams}
            jumpTo={jumpTo}
            catchError={catchError}
          />
        );
      case "display":
        return <DisplayResults inputData={finalTeams} jumpTo={jumpTo} />;
      case "error":
        return <ErrorCatch jumpTo={jumpTo} category={errMsg} />;
      default:
        return (
          <p>
            Something has gone wrong. Please refresh this page and try again.
          </p>
        );
    }
  }

  return <div>{handleChange()}</div>;
}
