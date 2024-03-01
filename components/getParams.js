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

/**
 * Component for configuring parameters before processing data
 * 
 * @param {number} dataLen - The length of the data
 * @param {function} updateNumTeams - Function to update the number of teams
 * @param {function} updateRankings - Function to update the user defined rankings
 * @param {function} jumpTo - Function to navigate to another step in the team formation process
 * @returns {JSX.Element} - The rendered component
 */
function GetParams({ dataLen, updateNumTeams, updateRankings, jumpTo }) {
  const rankings = {
    emba: [
      {
        displayValue: "Gender",
        colLabel: "Gender",
        icon: "bi bi-gender-ambiguous",
        disabled: false,
        variant: 2,
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
        variant: 2,
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
        icon: "bi bi-award",
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
        icon: "bi bi-fingerprint",
        disabled: false,
      },
      {
        displayValue: "Function",
        colLabel: "Function",
        icon: "bi bi-laptop",
        disabled: false,
      },
      {
        displayValue: "UG School Country",
        colLabel: "UG School Country",
        icon: "bi bi-geo-alt",
        disabled: false,
      },
      {
        displayValue: "Primary Citizenship",
        colLabel: "Primary Citizenship",
        icon: "bi bi-person-vcard",
        disabled: false,
      },
    ],

    ew: [
      {
        displayValue: "Gender",
        colLabel: "Gender",
        icon: "bi bi-gender-ambiguous",
        disabled: false,
        variant: 3,
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
        icon: "bi bi-award",
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
        icon: "bi bi-fingerprint",
        disabled: false,
      },
      {
        displayValue: "Function",
        colLabel: "Function",
        icon: "bi bi-laptop",
        disabled: false,
      },
      {
        displayValue: "UG School Country",
        colLabel: "UG School Country",
        icon: "bi bi-geo-alt",
        disabled: false,
      },
      {
        displayValue: "Primary Citizenship",
        colLabel: "Primary Citizenship",
        icon: "bi bi-person-vcard",
        disabled: false,
      },
      {
        displayValue: "Time Zone",
        colLabel: "Time Zone",
        icon: "bi bi-clock-history",
        disabled: false,
      },
    ],
  };
  const [finalRankings, setFinalRankings] = useState(rankings);
  const [selectedGroup, setSelectedGroup] = useState("emba");
  const [numTeams, setNumTeams] = useState("");
  const [groupSize, setGroupSize] = useState("");

  /**
   * Update the final rankings state
   * 
   * @param {Object} ranks - The updated rankings
   */
  const updateFinalRankings = (ranks) => setFinalRankings(ranks);

  /**
   * Handle input change for the number of teams
   * 
   * @param {Object} event - The input change event 
   */
  const onNumTeamsInput = ({ target: { value } }) => {
    setNumTeams(value);
    setGroupSize(Math.ceil(dataLen / value));
  };

  /**
   * Handle input change for the group size
   * 
   * @param {Object} event - The input change event 
   */
  const onGroupSizeInput = ({ target: { value } }) => {
    setGroupSize(value);
    setNumTeams(Math.ceil(dataLen / value));
  };

  /**
   * Handle form submission
   * 
   * @param {Object} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    let res = finalRankings[selectedGroup].filter((rank) => !rank.disabled);
    updateRankings(res);
    updateNumTeams(parseInt(numTeams));
    jumpTo("process");
  };

  /**
   * @param {string} id - The unique id for the tooltip
   * @param {ReactNode} children - The children elements
   * @returns {JSX.Element} - The rendered component
   */
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
          <Tab eventKey="ft" title="Full-time MBA">
            <DndTab
              eventKey="ft"
              selectedGroup={selectedGroup}
              finalRankings={finalRankings}
              updateFinalRankings={updateFinalRankings}
            />
          </Tab>
          <Tab eventKey="ew" title="Evening / Weekends">
            <DndTab 
              eventKey="ew"
              selectedGroup={selectedGroup}
              finalRankings={finalRankings}
              updateFinalRankings={updateFinalRankings}
            />
          </Tab>
        </Tabs>
      </Form.Group>
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
