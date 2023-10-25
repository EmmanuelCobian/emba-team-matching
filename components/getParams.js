import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import classnames from "classnames";
import styles from "@/styles/GetParams.module.css";

function GetParams({ dataLen, updateNumTeams, updateRankings, jumpTo }) {
  const rankings = [
    { item: "Gender", icon: "bi bi-gender-ambiguous", disabled: false },
    { item: "Military Status", icon: "bi bi-wrench", disabled: false },
    { item: "Citizenship Status", icon: "bi bi-globe-americas", disabled: false },
    { item: "Industry", icon: "bi bi-briefcase", disabled: false },
    { item: "Time Zone", icon: "bi bi-clock", disabled: false},
    { item: "Degree Major", icon: "bi bi-pencil", disabled: false},
    { item: "Age", icon: "bi bi-universal-access", disabled: false },
  ];
  const [finalRankings, setFinalRankings] = useState(rankings);
  const [numTeams, setNumTeams] = useState("");
  const [groupSize, setGroupSize] = useState("");

  const onNumTeamsInput = ({ target: { value } }) => {
    setNumTeams(value);
    setGroupSize(Math.ceil(dataLen / value));
  };

  const onGroupSizeInput = ({ target: { value } }) => {
    setGroupSize(value);
    setNumTeams(Math.ceil(dataLen / value));
  };

  const handleCheckChange = (e) => {
    let rankTarget = e.target.id;
    const items = Array.from(finalRankings);
    for (let i = 0; i < items.length; i++) {
      let rank = items[i];
      if (rank.item == rankTarget) {
        rank.disabled = e.target.checked;
        if (e.target.checked) {
          items.splice(i, 1);
          items.splice(items.length, 0, rank);
        } else {
          items[i] = rank;
        }
        setFinalRankings(items);
      }
    }
  };

  function handleOnDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const items = Array.from(finalRankings);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFinalRankings(items);
  }

  function getItemStyle(isDragging, isDragDisabled, draggableStyle) {
    return {
      // some basic styles to make the items look a bit nicer
      userSelect: "none",
      padding: 8 * 2,
      margin: `0 0 8px 0`,

      // change background colour if dragging
      background: isDragDisabled
        ? "#46535E"
        : isDragging
        ? "#C4820E"
        : "#003262",
      color: isDragging ? "#fff" : "#fff",
      cursor: isDragDisabled ? "not-allowed" : "grab",

      // styles we need to apply on draggables
      ...draggableStyle,
    };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setNumTeams();
    let res = finalRankings.filter((rank) => !rank.disabled);
    updateRankings(res);
    updateNumTeams(parseInt(numTeams));
    jumpTo("process");
  };

  const Link = ({ id, children }) => (
    <OverlayTrigger overlay={<Tooltip id={id}><img src="images/checkbox.jpg"/></Tooltip>}>
      <span className="text-primary text-decoration-underline">
        {children}
      </span>
    </OverlayTrigger>
  )

  return (
    <Form onSubmit={handleSubmit} className="mt-5">
      <Form.Group className={styles.dnd}>
        <Form.Label>
          Drag and drop the rankings with highest priority at the top and lowest
          at the bottom. <br />
          Select the {' '}
          <Link id="t-1">
           checkbox
          </Link> to the right of each row for any category that you don't wish to include
          in the matching process.
        </Form.Label>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="rankings">
            {(provided) => (
              <ListGroup
                className={classnames("rankings mb-4 w-100 text-start")}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {finalRankings.map(({ item, icon, disabled }, index) => {
                  return (
                    <Draggable
                      key={item}
                      draggableId={item}
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(provided, snapshot) => (
                        <ListGroup.Item
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            disabled,
                            provided.draggableProps.style
                          )}
                        >
                          <i className={classnames(icon, "me-2")} />
                          {item}
                          <Form.Check
                            onChange={handleCheckChange}
                            inline
                            reverse
                            type="checkbox"
                            id={item}
                            className="float-end"
                          />
                        </ListGroup.Item>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ListGroup>
            )}
          </Droppable>
        </DragDropContext>
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