import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import classnames from "classnames";
import DndTab from "./dndTab";
import styles from "@/styles/GetParams.module.css";

function GetParams({ dataLen, updateNumTeams, updateRankings, jumpTo }) {
  const rankings = {
    emba: [
      {
        displayValue: "Gender",
        colLabel: "Gender",
        icon: "bi bi-gender-ambiguous",
        disabled: false,
      },
      {
        displayValue: "Military Status",
        colLabel: "Military Status",
        icon: "bi bi-wrench",
        disabled: false,
      },
      {
        displayValue: "Citizenship Status",
        colLabel: "Citizenship Status",
        icon: "bi bi-globe-americas",
        disabled: false,
      },
      {
        displayValue: "Industry",
        colLabel: "Industry",
        icon: "bi bi-graph-up",
        disabled: false,
      },
      {
        displayValue: "Age",
        colLabel: "Age",
        icon: "bi bi-universal-access",
        disabled: false,
      },
    ],

    ft: [
      {
        displayValue: "Gender",
        colLabel: "Gender",
        icon: "bi bi-gender-ambiguous",
        disabled: false,
      },
      {
        displayValue: "Citizenship Status",
        colLabel: "Citizenship Status",
        icon: "bi bi-globe-americas",
        disabled: false,
      },
      {
        displayValue: "PQT",
        colLabel: "PQT",
        icon: "bi bi-briefcase",
        disabled: false,
      },
      {
        displayValue: "Underrepresented",
        colLabel: "UR",
        icon: "bi bi-people",
        disabled: false,
      },
      {
        displayValue: "School Major",
        colLabel: "UG School Major",
        icon: "bi bi-laptop",
        disabled: false,
      },
      {
        displayValue: "Industry",
        colLabel: "Industry",
        icon: "bi bi-graph-up",
        disabled: false,
      },
      {
        displayValue: "Military Status",
        colLabel: "Military Status",
        icon: "bi bi-wrench",
        disabled: false,
      },
      {
        displayValue: "School Name",
        colLabel: "UG School Name",
        icon: "bi bi-mortarboard",
        disabled: false,
      },
      {
        displayValue: "Employer",
        colLabel: "Employer",
        icon: "bi bi-person-badge",
        disabled: false,
      },
      {
        displayValue: "Ethnicity",
        colLabel: "Ethnicity",
        icon: "bi bi-flag",
        disabled: false,
      },
    ],
  };
  const [finalRankings, setFinalRankings] = useState(rankings);
  const [selectedGroup, setSelectedGroup] = useState("emba");
  const [numTeams, setNumTeams] = useState("");
  const [groupSize, setGroupSize] = useState("");

  const updateFinalRankings = (ranks) => setFinalRankings(ranks);

  const onNumTeamsInput = ({ target: { value } }) => {
    setNumTeams(value);
    setGroupSize(Math.ceil(dataLen / value));
  };

  const onGroupSizeInput = ({ target: { value } }) => {
    setGroupSize(value);
    setNumTeams(Math.ceil(dataLen / value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let res = finalRankings[selectedGroup].filter((rank) => !rank.disabled);
    updateRankings(res);
    updateNumTeams(parseInt(numTeams));
    jumpTo("process");
  };

  const Link = ({ id, children }) => (
    <OverlayTrigger
      overlay={
        <Tooltip id={id}>
          <img src="images/checkbox.jpg" />
        </Tooltip>
      }
    >
      <span className="text-primary text-decoration-underline">{children}</span>
    </OverlayTrigger>
  );

  return (
    <Form onSubmit={handleSubmit} className="mt-5">
      <Form.Group className={styles.dnd}>
        <Form.Label>
          Drag and drop the rankings with highest priority at the top and lowest
          at the bottom. <br />
          Select the <Link id="t-1">checkbox</Link> to the right of each row for
          any category that you don't wish to include in the matching process.
        </Form.Label>
        <Tabs
          defaultActiveKey="emba"
          activeKey={selectedGroup}
          onSelect={(k) => setSelectedGroup(k)}
          id="tabs"
          className="my-3"
          fill
        >
          <Tab eventKey="emba" title="EMBA">
            <DndTab
              eventKey="emba"
              selectedGroup={selectedGroup}
              finalRankings={finalRankings}
              updateFinalRankings={updateFinalRankings}
            />
          </Tab>
          <Tab eventKey="ft" title="Fill-time MBA">
            <DndTab
              eventKey="ft"
              selectedGroup={selectedGroup}
              finalRankings={finalRankings}
              updateFinalRankings={updateFinalRankings}
            />
          </Tab>
        </Tabs>
      </Form.Group>
      {/* TODO: idea. add a range slider that lets you adjust the granularity of your data */}
      {/* <Form.Group className={classnames(styles.dnd, 'my-5')}>
        <Form.Label>Use the slider to select the granularity of your data </Form.Label>
        <Form.Range />
      </Form.Group> */}
      <Form.Group className={styles.dnd}>
        <Form.Label>Input a number in either field</Form.Label>
        <Row>
          <Col sm={12} md={4} className="text-center">
            <Form.Label>Number of Groups</Form.Label>
            <Form.Control
              required
              type="number"
              onChange={onNumTeamsInput}
              value={numTeams}
              min={1}
              max={dataLen}
              className={styles.teamSizeInput}
            />
          </Col>
          <Col sm={12} md={4} className="text-center">
            <p>- OR -</p>
          </Col>
          <Col sm={12} md={4} className="text-center">
            <Form.Label>Group Size</Form.Label>
            <Form.Control
              required
              type="number"
              onChange={onGroupSizeInput}
              value={groupSize}
              min={1}
              max={dataLen}
              className={styles.teamSizeInput}
            />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="d-flex justify-content-center mb-4">
        <Button
          onClick={() => jumpTo("file")}
          className={classnames(styles.btn)}
        >
          Restart
        </Button>
        <Button type="submit" className={classnames("ms-2", styles.btn)}>
          Continue
        </Button>
      </Form.Group>
    </Form>
  );
}

export default GetParams;
