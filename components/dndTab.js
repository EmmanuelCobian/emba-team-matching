import React from "react";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import classnames from "classnames";

/**
 * Component for handling drag-and-drop functionality within a department tab
 * 
 * @param {string} eventKey - The key id for the tab
 * @param {string} selectedGroup - The currently selected department
 * @param {Object} finalRankings - The final rankings state
 * @param {function} updateFinalRankings - Function to update final rankings state
 * @returns {JSX.Element} - The rendered component
 */
export default function DndTab({
  eventKey,
  selectedGroup,
  finalRankings,
  updateFinalRankings,
}) {

  /**
   * Update whether rankings are disabled or not 
   * 
   * @param {Object} e - event object
   */
  const handleCheckChange = (e) => {
    let rankTarget = e.target.id;
    let items = Array.from(finalRankings[selectedGroup]);
    for (let i = 0; i < items.length; i++) {
      let rank = items[i];
      if (rank.displayValue == rankTarget) {
        rank.disabled = e.target.checked;
        if (e.target.checked) {
          items.splice(i, 1);
          items.splice(items.length, 0, rank);
        } else {
          items[i] = rank;
        }
        updateFinalRankings((prevState) => ({
          ...prevState,
          [selectedGroup]: items,
        }));
      }
    }
  };

  /**
   * Update the ordering of rankings after user finishes dragging them
   * 
   * @param {Object} result -  DragDropContext object
   */
  const handleOnDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(finalRankings[selectedGroup]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateFinalRankings((prevState) => ({
      ...prevState,
      [selectedGroup]: items,
    }));
  };

  /**
   * Get or Update the style for the current DnD item
   * 
   * @param {boolean} isDragging - Boolean for whether the current draggable item is being dragged
   * @param {boolean} isDragDisabled - Boolean for whether the current item has dragging disabled
   * @param {Object} draggableStyle - Previous styles for this item
   * @returns {Object} - The style for a particular DnD object
   */
  const getItemStyle = (isDragging, isDragDisabled, draggableStyle) => {
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
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="rankings">
        {(provided) => (
          <ListGroup
            className={classnames("rankings mb-4 w-100 text-start")}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {finalRankings[eventKey].map(
              ({ displayValue, icon, disabled }, index) => {
                return (
                  <Draggable
                    key={displayValue}
                    draggableId={displayValue}
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
                        {displayValue}
                        <Form.Check
                          onChange={handleCheckChange}
                          inline
                          reverse
                          type="checkbox"
                          id={displayValue}
                          className="float-end"
                        />
                      </ListGroup.Item>
                    )}
                  </Draggable>
                );
              }
            )}
            {provided.placeholder}
          </ListGroup>
        )}
      </Droppable>
    </DragDropContext>
  );
}
