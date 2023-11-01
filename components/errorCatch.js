import classnames from "classnames";
import { Button, Row, Col } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import styles from '@/styles/ErrorCatch.module.css';

function ErrorCatch({ jumpTo, category }) {
  let colName = category;
  let allowedTypes = "";
  switch (category) {
    case "Gender":
      allowedTypes = (
        <Row>
          <Col>
            <li>Woman</li>
          </Col>
          <Col>
            <li>Man</li>
          </Col>
        </Row>
      );
      break;
    case "Military Status":
      allowedTypes = (
        <Row>
          <Col>
            <li>Army</li>
            <li>Air Force</li>
            <li>Navy</li>
          </Col>
          <Col>
            <li>Marine Corps</li>
            <li>Empty cell</li>
          </Col>
        </Row>
      );
      break;
    case "Citizenship Status":
      allowedTypes = (
        <Row>
          <Col>
            <li>US</li>
            <li>PR</li>
          </Col>
          <Col>
            <li>FN</li>
          </Col>
        </Row>
      );
      break;
    case "Industry":
      allowedTypes = (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
          <Col>
            <li>Empty cell</li>
          </Col>
        </Row>
      );
      break;
    case "Age":
      allowedTypes = (
        <Row>
          <Col>
            <li>Any numerical value</li>
          </Col>
        </Row>
      );
      break;
    case "Team":
      allowedTypes = (
        <Row>
          <Col>
            <li>This column is forbidden from being used in your .csv file</li>
          </Col>
        </Row>
      );
      break;
    case "Time Zone":
      allowedTypes = (
        <Row>
          <Col>
            <li>Parameters are yet to be implemented for this column</li>
          </Col>
        </Row>
      );
      break;
    case "Degree Major":
      allowedTypes = (
        <Row>
          <Col>
            <li>Parameters are yet to be implemented for this column</li>
          </Col>
        </Row>
      );
      break;
  }
  return (
    <div>
      <p className="text-center">
        An error was encountered with the{" "}
        <span className="fw-bold">{category}</span> column. Please double check
        that your .csv file aligns with the requirements.
      </p>
      <Table hover bordered responsive striped className="w-75 mx-auto">
        <thead>
          <tr>
            <th>Column Name</th>
            <th>Allowed Values</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{colName}</td>
            <td>
              <ul>{allowedTypes}</ul>
            </td>
          </tr>
        </tbody>
      </Table>
      <div className="text-center">
        <Button
          className={classnames(styles.btn, "mb-3")}
          onClick={() => jumpTo("file")}
        >
          Start Again
        </Button>
      </div>
    </div>
  );
}

export default ErrorCatch;
