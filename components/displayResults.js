import * as dfd from "danfojs";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import classnames from "classnames";
import styles from "../styles/DisplayResults.module.css";

function DisplayResults({ inputData, jumpTo }) {
  function downloadResults(results, fileName) {
    dfd.toCSV(results, { fileName: fileName, download: true });
  }

  return (
    <>
      <div className="text-center">
        <p className="w-75 mx-auto">
          Here are the results! <br /> Because of the nature of this process,
          you may not get satisfactory results on your first attempt. In that
          case, rerun this for better results.
        </p>
        <Button
          className={classnames("mb-3", styles.btn)}
          onClick={() =>
            downloadResults(
              dfd.concat({ dfList: inputData, axis: 0 }),
              "teamMatchingResults"
            )
          }
        >
          Download Results
        </Button>
        <Button
          onClick={() => jumpTo("file")}
          className={classnames("mb-3", "ms-2", styles.btn)}
        >
          Start Over
        </Button>
      </div>
      <Tabs defaultActiveKey="1" className="mb-3" variant="underline" justify>
        {inputData.map((team, index) => {
          return (
            <Tab eventKey={index + 1} title={`Team ${index + 1}`} key={index}>
              <Table striped bordered hover responsive className="mb-4">
                <thead>
                  <tr>
                    {team.columns.map((col) => {
                      return <th key={col}>{col}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {dfd
                    .toJSON(team, { format: "column" })
                    .map((oneRow, index) => {
                      return (
                        <tr key={index}>
                          {Object.keys(oneRow).map((col) => {
                            return (
                              <td key={String(index) + String(col)}>
                                {oneRow[col]}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </Tab>
          );
        })}
      </Tabs>
    </>
  );
}

export default DisplayResults;
