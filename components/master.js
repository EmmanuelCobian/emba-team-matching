import React, { useState } from "react";
import Fade from "react-bootstrap/Fade";
import FileUpload from "@/components/fileUpload";
import ErrorCatch from "@/components/errorCatch";
import GetParams from "@/components/getParams";
import ProcessData from "@/components/processData";
import DisplayResults from "@/components/displayResults";

/**
 * Component for managing the different states a user goes through when creating teams
 *
 * @returns {JSX.Element} - The rendered component
 */
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

  /**
   * Update input data state with results from the file upload
   *
   * @param {Object} results - The results from file upload
   */
  const updateInputData = (results) => {
    setInputData((previousState) => {
      return { ...previousState, data: results.data };
    });
  };

  /**
   * Update teams state
   *
   * @param {Array} teams - the teams data
   */
  const updateTeams = (teams) => setTeams(teams);

  /**
   * Update the number of teams state
   *
   * @param {number} value - The number of teams
   */
  const updateNumTeams = (value) => setNumTeams(value);

  /**
   * Update rankings state
   *
   * @param {Array} ranks - The rankings set by the user
   */
  const updateRankings = (ranks) => setRankings(ranks);

  /**
   * Jump to the next state
   *
   * @param {string} nextStage - The next state to navigate to
   */
  const jumpTo = (nextStage) => setStep(nextStage);

  /**
   * Catch an error and navigate to the corresponding error state
   * 
   * @param {string} nextStage - The next state to navigate to (error state)
   * @param {string} error - The error message
   */
  const catchError = (nextStage, error) => {
    setStep(nextStage);
    setErrMsg(error);
  };

  return (
    <div>
      {/* File Upload Stage */}
      <Fade in={step == "file"}>
        {step == "file" ? (
          <div>
            <FileUpload updateInputData={updateInputData} jumpTo={jumpTo} />
          </div>
        ) : (
          <span></span>
        )}
      </Fade>

      {/* Parameters Stage */}
      <Fade in={step == "params"}>
        {step == "params" ? (
          <div>
            <GetParams
              dataLen={inputData.data.length}
              updateNumTeams={updateNumTeams}
              updateRankings={updateRankings}
              jumpTo={jumpTo}
            />
          </div>
        ) : (
          <span></span>
        )}
      </Fade>

      {/* Data Processing Stage */}
      <Fade in={step == "process"}>
        {step == "process" ? (
          <div>
            <ProcessData
              inputData={inputData}
              numTeams={numTeams}
              rankings={rankings}
              updateTeams={updateTeams}
              jumpTo={jumpTo}
              catchError={catchError}
            />
          </div>
        ) : (
          <span></span>
        )}
      </Fade>

      {/* Display Results Stage */}
      <Fade in={step == "display"}>
        {step == "display" ? (
          <div>
            <DisplayResults inputData={finalTeams} jumpTo={jumpTo} />
          </div>
        ) : (
          <span></span>
        )}
      </Fade>

      {/* Error Catch Stage */}
      <Fade in={step == "error"}>
        {step == "error" ? (
          <div>
            <ErrorCatch jumpTo={jumpTo} category={errMsg} />
          </div>
        ) : (
          <span></span>
        )}
      </Fade>
    </div>
  );
}
