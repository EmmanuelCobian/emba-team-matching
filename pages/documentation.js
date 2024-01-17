import Layout from "@/components/layout";
import { Container, Row, Col } from "react-bootstrap";
import Table from "react-bootstrap/Table";

export default function Instructions() {
  const requirements = [
    {
      name: "Gender",
      allowed: (
        <Row>
          <Col>
            <li>Woman</li>
          </Col>
          <Col>
            <li>Man</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "PQT",
      allowed: (
        <Row>
          <Col>
            <li>P</li>
            <li>Q</li>
          </Col>
          <Col>
            <li>T</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "UR",
      allowed: (
        <Row>
          <Col>
            <li>Underrepresented</li>
          </Col>
          <Col>
            <li>Empty Cell</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Continent",
      allowed: (
        <Row>
          <Col>
            <li>North America</li>
            <li>South America</li>
            <li>Europe</li>
          </Col>
          <Col>
            <li>Asia</li>
            <li>Africa</li>
            <li>Australia</li>
            <li>Antartica</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Military Status",
      allowed: (
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
      ),
    },
    {
      name: "Industry",
      allowed: (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
          <Col>
            <li>Empty Cell</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Citizen Status",
      allowed: (
        <Row>
          <Col>
            <li>US</li>
            <li>PR</li>
          </Col>
          <Col>
            <li>FN</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Age",
      allowed: (
        <Row>
          <Col>
            <li>Any numerical value</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Ethnicity",
      allowed: (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "UG School Name",
      allowed: (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "UG School Major",
      allowed: (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Employer",
      allowed: (
        <Row>
          <Col>
            <li>Any non-numerical value</li>
          </Col>
        </Row>
      ),
    },
    {
      name: "Team",
      allowed: (
        <Row>
          <Col>
            <li className="w-75">
              This column name is forbidden from being used in your .csv file.
              This column name will be added to the result of the algorithm and
              duplicate column names aren't allowed.
            </li>
          </Col>
        </Row>
      ),
    },
    {
      name: "#",
      allowed: (
        <Row>
          <Col>
            <li className="w-75">
              Any column or row containing the "#" character is forbidden from
              being used in your .csv file. When downloading the result .csv
              file, "#" characters are treated as comments so everything after
              the "#" will be ommitted from the outputted .csv file.
            </li>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Layout>
      <Container>
        <h3>Input Data Documentation</h3>
        <p className="my-3">
          Below you'll find information on the required information your .csv
          file needs for the team matching process to run successfully. While
          your file doesn't necessarily need all the listed column names, any
          that are included must meet the specified criteria. Your file may have
          any number of extra columns from the ones mentioned here,{" "}
          <span className="fw-semibold">
            except for columns titled "Team" and columns/rows containing the "#"
            character
          </span>
          . All of the following requirements must be fulfilled as described
          below for optimal results.
        </p>
        <Table hover bordered striped className="mb-5">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Allowed Values</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr key={req.name}>
                <td>{req.name}</td>
                <td>
                  <ul className="my-0">{req.allowed}</ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Layout>
  );
}
