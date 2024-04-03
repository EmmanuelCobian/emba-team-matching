import React, { useState, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import classnames from "classnames";
import * as dfd from "danfojs";

/**
 * Component that handles the computation of teams and displays a progress bar
 *
 * @param {Object} inputData - The parsed CSV file represented as an Object
 * @param {number} numTeams - The number of teams
 * @param {Array} rankings - The rankings specified by the user
 * @param {function} updateTeams - Function to update the teams once they've been finalized
 * @param {function} jumpTo - Function to navigate to another section
 * @param {function} catchError - Function to handle displaying any encountered errors
 * @returns  {JSX.Element} - The rendered component
 */
function ProcessData({
  inputData,
  numTeams,
  rankings,
  updateTeams,
  jumpTo,
  catchError,
}) {
  let emba = new dfd.DataFrame(inputData.data);
  const MAX_TEAM_SIZE = Math.ceil(emba.shape[0] / numTeams);
  // const NUM_ITERATIONS = 12500;
  const NUM_ITERATIONS = 1;
  const WEIGHTS = generateWeights(rankings.length);
  const [now, setNow] = useState(0);
  const [rerender, setRerender] = useState(true);
  const [afterRender, setAfterRender] = useState(false);

  /**
   * Generate normalized and exponentially decreasing weights
   *
   * @param {number} n - Number of weights
   * @returns {Array} - Weights
   */
  function generateWeights(n) {
    let sequence = [];
    let num = 1;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      sequence.push(num);
      sum += num;
      num /= 2;
    }
    for (let i = 0; i < n; i++) {
      sequence[i] /= sum;
    }

    return sequence;
  }

  /**
   * Find the argmin of an array of numbers
   *
   * @param {Array} arr - Array you want to find the min arg for
   * @returns {number} - Index of min element
   */
  const argMin = (arr) => {
    return arr.reduce((iMax, x, i, a) => (x < a[iMax] ? i : iMax), 0);
  };

  /**
   * Assert that conition is true, otherwise throw an error
   * 
   * @param {boolean} condition 
   * @param {string} message 
   */
  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  /**
   * Handle adding a row into a specific team number
   *
   * @param {dfd.DataFrame} data - The current team
   * @param {dfd.Series} row - The row you want to add to data
   * @param {number} teamNum - The team number
   * @returns {dfd.DataFrame} - The new data
   */
  const handleAppend = (data, row, teamNum) => {
    let newData = { Team: [teamNum] };
    let newRow = new dfd.DataFrame(newData);
    let rowCols = row.columns;
    for (let i = 0; i < rowCols.length; i++) {
      let col = rowCols[i];
      if (col == "Team") continue;
      newRow = newRow.addColumn(col, row[col]);
    }
    data = data.append(newRow, [data.shape[0]]);
    let firstRow = data.iloc({ rows: [0] });
    let nonNaCount = firstRow.count();
    if (nonNaCount.values[0] == 0) {
      data = data.drop({ index: [0] });
      data.resetIndex({ inplace: true });
    }
    return data;
  };

  /**
   * Find the element with the least number of entries in a column
   *
   * @param {string} col - Name of the column
   * @param {Array} uniqueVals - List of unique values in col
   * @returns {string} - Name of label that appears the least in col
   */
  const findMinLabel = (col, uniqueVals) => {
    let minLabel = uniqueVals[0];
    let minSize = Infinity;
    for (let i = 0; i < uniqueVals.length; i++) {
      let size = emba[col].eq(uniqueVals[i]).sum();
      if (size < minSize) {
        minSize = size;
        minLabel = uniqueVals[i];
      }
    }
    return minLabel;
  };

  /**
   * Get the size of all the teams
   *
   * @param {Array} teams - List where each element is a DataFrame
   * @returns {Array} - List where each element, i, is the size of team i
   */
  const getTeamSizes = (teams) => {
    let result = [];
    teams.forEach((team) => {
      let firstRow = team.iloc({ rows: [0] });
      let nonNaCount = firstRow.count();
      if (nonNaCount.values[0] == 0) {
        result.push(0);
      } else {
        result.push(team.shape[0]);
      }
    });
    return result;
  };

  /**
   * Get the number of times a certain value appears in each team
   *
   * @param {Array} teams - List where each element is a team
   * @param {string} colName - Name of column to search
   * @param {Array} colValOptions  - List of allowed values for this column
   * @returns {Array} - List of element numbers for each team
   */
  const getNumLabelPerTeam = (teams, colName, colValOptions) => {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      let items = teams[i][colName].values;
      let numLabel = 0;
      for (let j = 0; j < items.length; j++) {
        let item = items[j];
        if (colValOptions.includes(item)) {
          numLabel += 1;
        }
      }
      result.push(numLabel);
    }
    return result;
  };

  /**
   * Get all the row labels from a specific column for each team
   *
   * @param {Array} teams - List where each element is a team
   * @param {string} colName - Name of column to search
   * @returns {Array} - List where each element contains a list labels
   */
  const getAggLabelPerTeam = (teams, colName) => {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      let values = teams[i][colName].values;
      if (values.length == 1 && values[0] == null) {
        values = [];
      }
      result.push(values);
    }

    return result;
  };

  /**
   * Get the number of duplicate label each team has
   *
   * @param {Array} team - List of labels for a team
   * @param {string} label - Name of label to look for duplicates
   */
  const getLabelDupes = (team, label) => {
    let teamSeries = new dfd.Series(team);
    let boolMask = teamSeries.eq(label);
    return boolMask.sum();
  };

  /**
   * Assign people to teams such that each team has at least minNum number of label
   *
   * @param {dfd.DataFrame} data - Remaining rows left to assign
   * @param {Array} teams - List where each element is a team
   * @param {string} col - Name of the column being assigned
   * @param {Array} labels - Name(s) of the label(s) we want a minimum number of
   * @param {number} minNum - Lower-bound for number of label per team
   * @returns {Object} - Remaining rows to assign and updated teams
   */
  const minDistributeAssign = (data, teams, col, labels, minNum) => {
    let teamIndex = 0;
    let numLabel = getNumLabelPerTeam(teams, col, labels);
    let teamSizes = getTeamSizes(teams);
    data = data.resetIndex();
    let numRows = data.shape[0];

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      if (!labels.includes(row[col].iat(0))) {
        continue;
      }

      if (numLabel.every((elm) => elm == minNum)) {
        minNum += 1;
      }
      for (let j = 0; j < teams.length; j++) {
        if (numLabel[j] < minNum && teamSizes[j] < MAX_TEAM_SIZE) {
          teamIndex = j;
          break;
        }
      }

      teamSizes[teamIndex] += 1;
      numLabel[teamIndex] += 1;
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      data = data.drop({ index: [i] });
    }

    // TODO: handle the case where sum(numLabel) % minNum != 0
    let sumNumLabel = numLabel.reduce((partial, elm) => partial + elm, 0);
    if (sumNumLabel % minNum != 0 && teams.length < (sumNumLabel / minNum)) {
      console.log("sum(numLabel) % minNum != 0");
    }

    return { data: data, teams: teams };
  };

  /**
   * Assign all remaining people such that they're spread out by labels in col. Data will be empty after this function
   *
   * @param {dfd.DataFrame} data - Remaining rows left to assign
   * @param {Array} teams - List where each element is a team
   * @param {string} col - Name of the column we want to separate people by
   * @returns {Object} - Remaining rows to assign and updated teams
   */
  const fillRemainingAssign = (data, teams, col) => {
    let teamLabels = getAggLabelPerTeam(teams, col);
    let teamSizes = getTeamSizes(teams);
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let label = row[col].iat(0);
      if (label == "") {
        continue;
      }

      let dupesPerTeam = teamLabels.map((team) => getLabelDupes(team, label));
      let teamIndex = 0;
      let minDupes = Infinity;
      let minDupeTeamSize = Infinity;
      for (let index = 0; index < teams.length; index++) {
        let dupes = dupesPerTeam[index];
        let teamSize = teamSizes[index];
        if (
          dupes <= minDupes &&
          teamSize <= minDupeTeamSize &&
          teamSize < MAX_TEAM_SIZE
        ) {
          teamIndex = index;
          minDupes = dupes;
          minDupeTeamSize = teamSize;
        }
      }

      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      teamSizes[teamIndex] += 1;
      teamLabels[teamIndex] = teamLabels[teamIndex].concat([label]);
      data = data.drop({ index: [i] });
    }

    return { data: data, teams: teams };
  };

  /**
   * Assign people to teams such that the label that appears the least in col is spread out evenly
   *
   * @param {dfd.DataFrame} data - Remaining rows left to assign
   * @param {Array} teams - List where each element is a team
   * @param {string} col - Name of the column being assigned
   * @param {Array} allowedValues - List of allowed values for the column we want to assign
   * @param {boolean} containsEmpty - Boolean to tell whether this column may contain empty values
   * @param {Array} remainingValues - List of values that remain to assign. Only changes if containsEmpty is true
   * @returns {Object} - Remaining rows to assign and updated teams
   */
  const distributeMinLabelAssign = (
    data,
    teams,
    col,
    allowedValues,
    containsEmpty,
    remainingValues
  ) => {
    if (containsEmpty && remainingValues.length == 0) {
      return { data: data, teams: teams };
    }
    const minLabel = findMinLabel(
      col,
      containsEmpty ? remainingValues : allowedValues
    );
    let numLabel = getNumLabelPerTeam(
      teams,
      col,
      containsEmpty ? allowedValues : [minLabel]
    );
    let teamSizes = getTeamSizes(teams);
    let minNumLabel = Math.min(...numLabel) + 1;
    let teamIndex = 0;
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      if (row[col].iat(0) != minLabel) {
        continue;
      }

      let addedToTeam = false;
      for (let j = 0; j < teams.length; j++) {
        if (
          numLabel[j] < minNumLabel &&
          teamSizes[j] < MAX_TEAM_SIZE &&
          (!containsEmpty || !teams[j][col].values.includes(minLabel))
        ) {
          teamIndex = j;
          addedToTeam = true;
          break;
        }
      }

      if (!addedToTeam) {
        teamIndex = argMin(teamSizes);
      }

      teamSizes[teamIndex] += 1;
      numLabel[teamIndex] += 1;
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      data = data.drop({ index: [i] });
    }

    if (containsEmpty) {
      remainingValues.splice(remainingValues.indexOf(minLabel), 1);
      return distributeMinLabelAssign(
        data,
        teams,
        col,
        allowedValues,
        true,
        remainingValues
      );
    } else {
      return { data: data, teams: teams };
    }
  };

  /**
   * Assign all remaining people such that each team has at most maxNum different values in col
   * 
   * @param {dfd.DataFrame} data - Remaining rows left to assign
   * @param {Array} teams - List where each element is a team
   * @param {string} col - Name of the column we want to separate people by
   * @param {int} maxNum - Upper-bound for number of unique values per team
   * @returns {Object} - Remaining rows to assign and updated teams
   */
  const assignNoMoreThan = (data, teams, col, maxNum) => {
    let teamLabels = getAggLabelPerTeam(teams, col);
    let uniqueLabels = teamLabels.map((team) => new Set(team));
    let teamSizes = getTeamSizes(teams);
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let label = row[col].iat(0);
      if (label == "") {
        continue;
      }

      let teamIndex = 0; 
      for (let j = 0; j < teams.length; j++) {
        let uniqueLabelsSize = uniqueLabels[j].size;
        if ((uniqueLabels[j].has(label) || (!uniqueLabels[j].has(label) && uniqueLabelsSize < maxNum)) && teamSizes[j] < MAX_TEAM_SIZE) {
          teamIndex = j;
          break;
        }
      }

    teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
    teamSizes[teamIndex] += 1;
    uniqueLabels[teamIndex].add(label)
    teamLabels[teamIndex] = teamLabels[teamIndex].concat([label]);
    data = data.drop({ index: [i] });
    }
    return { data: data, teams: teams };
  };

  const assignRemaining = (data, teams) => {
    let teamSizes = getTeamSizes(teams);
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let teamIndex = argMin(teamSizes);
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      teamSizes[teamIndex] += 1;
      data = data.drop({ index: [i] });
    }

    return { data: data, teams: teams };
  }


  /**
   * Validate that the data contains the right values given the rankings
   *
   * @param {dfd.DataFrame} data - Rows that were parsed from inputed CSV file
   */
  const dataValidation = (data) => {
    let uniqueValues;
    let allowedValues;
    let ranks = rankings.map((elm) => elm.colLabel);

    // validate gender column
    if (ranks.includes("Gender")) {
      if (!data.columns.includes("Gender")) {
        catchError("error", "Gender");
        throw new Error("gender error");
      }
      uniqueValues = data["Gender"].unique();
      allowedValues = ["Man", "Woman", "Nonbinary", "Decline to State", "Transgender Woman/Trans Woman", "Transgender Male/Trans Man", "Genderqueer/Gender Non-Conforming", "Different Identity", "Decline to State"];
      checkValues(uniqueValues, allowedValues, "Gender");
    }

    // validate PQT column
    if (ranks.includes("PQT")) {
      if (!data.columns.includes("PQT")) {
        catchError("error", "PQT");
        throw new Error("pqt error");
      }
      uniqueValues = data["PQT"].unique();
      allowedValues = ["P", "Q", "T"];
      checkValues(uniqueValues, allowedValues, "PQT");
    }

    // validate UR column
    if (ranks.includes("UR")) {
      if (!data.columns.includes("UR")) {
        catchError("error", "UR");
        throw new Error("underrepresented error");
      }
      uniqueValues = data["UR"].unique();
      allowedValues = ["Underrepresented", ""];
      checkValues(uniqueValues, allowedValues, "UR");
    }

    // validate Ethnicity column
    if (ranks.includes("Ethnicity")) {
      if (!data.columns.includes("Ethnicity")) {
        catchError("error", "Ethnicity");
        throw new Error("ethnicity error");
      }
      // check for codes?
    }

    // validate UG School Name
    if (ranks.includes("UG School Name")) {
      if (!data.columns.includes("UG School Name")) {
        catchError("error", "UG School Name");
        throw new Error("ug school name error");
      }
    }

    // validate UG School Major
    if (ranks.includes("UG School Major")) {
      if (!data.columns.includes("UG School Major")) {
        catchError("error", "UG School Major");
        throw new Error("ug school major error");
      }
    }

    // validate employer column
    if (ranks.includes("Employer")) {
      if (!data.columns.includes("Employer")) {
        catchError("error", "Employer");
        throw new Error("employer error");
      }
    }

    // validate military column
    if (ranks.includes("Military Status")) {
      if (!data.columns.includes("Military Status")) {
        catchError("error", "Military Status");
        throw new Error("military error");
      }
      uniqueValues = data["Military Status"].unique();
      allowedValues = ["Army", "Air Force", "Navy", "Marine Corps", ""];
      checkValues(uniqueValues, allowedValues, "Military Status");
    }

    // validate internationals column
    if (ranks.includes("Citizenship Status")) {
      if (!data.columns.includes("Citizenship Status")) {
        catchError("error", "Citizenship Status");
        throw new Error("citizenship status error");
      }
      uniqueValues = data["Citizenship Status"].unique();
      allowedValues = ["FN", "US", "PR"];
      checkValues(uniqueValues, allowedValues, "Citizenship Status");

      if (data.columns.includes("Continent")) {
        uniqueValues = data["Continent"].unique();
        allowedValues = [
          "North America",
          "South America",
          "Europe",
          "Africa",
          "Asia",
          "Australia",
          "Antartica",
        ];
        checkValues(uniqueValues, allowedValues, "Continent");
      }
    }

    // validate industry column
    if (ranks.includes("Industry")) {
      if (!data.columns.includes("Industry")) {
        catchError("error", "Industry");
        throw new Error("industry error");
      }
    }

    // validate function column 
    if (ranks.includes("Function")) {
      if (!data.columns.includes("Function")) {
        catchError("error", "Function");
        throw new Error("function error");
      }
    }

    // validate UG School Country 
    if (ranks.includes("UG School Country")) {
      if (!data.columns.includes("UG School Country")) {
        catchError("error", "UG School Country");
        throw new Error("ug school country error");
      }
    }

    // validate primary citizenship column 
    if (ranks.includes("Primary Citizenship")) {
      if (!data.columns.includes("Primary Citizenship")) {
        catchError("error", "Primary Citizenship");
        throw new Error("primary citizenship error");
      }
    }

    // validate Timezone column
    if (ranks.includes("Timezone")) {
      if (!data.columns.includes("Timezone")) {
        catchError("error", "Timezone");
        throw new Error("Timezone error");
      }
    }

    //validate age column
    if (ranks.includes("Age")) {
      if (!data.columns.includes("Age")) {
        catchError("error", "Age");
        throw new Error("age error");
      }
      let colType = data["Age"].dtype;
      if (colType == "string") {
        catchError("error", "Age");
        throw new Error("age error");
      }
    }

    // make sure there isn't a column called "Team"
    if (data.columns.includes("Team")) {
      catchError("error", "Team");
      throw new Error("forbidden column");
    }

    // check that there aren't any # characters
  };

  /**
   * Check to see if the Series of values only contains allowedValues
   *
   * @param {dfd.Series} values - Values from data
   * @param {Array} allowedValues - List of values that are allowed in this column
   * @param {string} category - The category we would label this error if one is ran into
   */
  const checkValues = (values, allowedValues, category) => {
    for (let i = 0; i < values.shape[0]; i++) {
      let value = values.iat(i);
      if (!allowedValues.includes(value)) {
        catchError("error", category);
        throw new Error(category + " error");
      }
    }
  };

  useEffect(() => {
    /**
     * Give a team a score based on the rankings and weights associated with those rankings
     *
     * @param {dfd.DataFrame} team - Data for a team
     * @returns {number} - The score for this team
     */
    const scoreOneTeam = (team) => {
      if (team.count().values[0] == 0) {
        return 0;
      }

      let score = 0;
      for (let i = 0; i < rankings.length; i++) {
        let rank = rankings[i].colLabel;
        let weight = WEIGHTS[i];
        switch (rank) {
          case "Gender":
            let numWomen = team["Gender"].eq("Woman").sum();
            score += numWomen * weight;
            break;
          case "Military Status":
            let vetMask = team["Military Status"].ne("");
            let numUniqueVets = team["Military Status"].loc(vetMask).nUnique();
            let numVets = team["Military Status"].loc(vetMask).shape[0];
            // give a large penalty for having duplicate military branches on the team
            if (numVets != numUniqueVets) {
              numVets = -2 * numVets;
            }
            score += numVets * weight;
            break;
          case "Timezone":
            let numUniqueTZ = team["Timezone"].nUnique();
            // give penalty for having more than 2 unique timezones
            if (numUniqueTZ > 2) {
              numUniqueTZ = -2 * numUniqueTZ;
            }
            score += numUniqueTZ * weight;
            break;
          case "PQT":
            let numQs = team["PQT"].eq("Q").sum();
            let numPs = team["PQT"].eq("P").sum();
            let numTs = team["PQT"].eq("T").sum();
            let numMinLabel = Math.abs(numQs - numPs) + Math.abs(numQs - numTs) + Math.abs(numPs - numTs);
            score += numMinLabel * weight;
            break;
          case "UR":
            let numUR = team["UR"].eq("Underrepresented").sum();
            if (numUR === 1) {
              score -= weight; // Subtract weight if there's only 1 underrepresented
            } else {
              score += numUR * weight; // Add weight for 0, 2, or more than 2 underrepresented
            }
            break;
          case "Ethnicity":
            let numUniqueEth = team["Ethnicity"].nUnique();
            score += numUniqueEth * weight;
            break;
          case "UG School Name":
            let numUniqueSchool = team["UG School Name"].nUnique();
            score += numUniqueSchool * weight;
            break;
          case "UG School Major":
            let numUniqueMajor = team["UG School Major"].nUnique();
            score += numUniqueMajor * weight;
            break;
          case "UG School Country":
            let numUniqueCountry = team["UG School Country"].nUnique();
            score += numUniqueCountry * weight;
            break;
          case "Employer":
            let numDiffEmployers = team["Employer"].nUnique();
            score += numDiffEmployers * weight;
            break;
          case "Function":
            let numDiffFunctions = team["Function"].nUnique();
            score += numDiffFunctions * weight;
            break;
          case "Citizenship Status":
            let numInternationals = team["Citizenship Status"].eq("FN").sum();
            score += numInternationals * weight;
            break;
          case "Continent":
            let numUniqueCont = team["Continent"].nUnique();
            score += numUniqueCont * weight;
            break;
          case "Industry":
            let numDiffIndustries = team["Industry"].nUnique();
            score += numDiffIndustries * weight;
            break;
          case "Age":
            let medianAge = team["Age"].median();
            score += medianAge * weight;
            break;
          default:
            score += 0;
            break;
        }
      }
      return score;
    };

    /**
     * Given an iteration of assigning teams, keep the highest difference in scores between teams. The goal is to minimize the difference in scores between teams.
     *
     * @param {Array} teams - List of team data
     * @returns {int} - The difference in scores between the two teams with the highest difference in scores
     */
    const scoreIteration = async (teams) => {
      let scores = [];
      teams.map((team) => scores.push(scoreOneTeam(team)));
      let scoreCombos = [];
      for (let i = 1; i < scores.length; i++) {
        let score = scores[i]
        if (score != scores[0]) {
          scoreCombos.push([scores[0], score])
        }
      }
      let scorePairs = scoreCombos.length == 0 ? [scores[0], scores[0]] : scoreCombos;
      let differences = scorePairs.map((pair) => Math.abs(pair[0] - pair[1]));
      let result = Math.max(...differences);
      return result;
    };

    /**
     * Compute one iteration of assigning teams based on the rankings.
     *
     * @param {dfd.DataFrame} data
     * @returns {Object} - The optimal teams for this run and the seed used to shuffle the data
     */
    const oneIteration = async (data) => {
      let teams = new Array(numTeams);
      let cols = ["Team"];
      let numCols = cols.push(...data.columns);
      teams.fill(
        new dfd.DataFrame([Array(numCols).fill(null)], { columns: cols })
      );
      let seed = Math.random();
      // let seed = 0.8960922433920508
      let shuffledData = await data.sample(data.shape[0], { seed: seed });
      let ongoing = { data: shuffledData, teams: teams };
      for (let i = 0; i < rankings.length; i++) {
        let rank = rankings[i].colLabel;
        let allowedValues;
        switch (rank) {
          case "Gender":
            let variant = rankings[i].variant;
            let womenLabels = ['Woman', 'Transgender Woman/Trans Woman']
            if (variant == 2) {
              ongoing = minDistributeAssign(
                ongoing.data,
                ongoing.teams,
                "Gender",
                womenLabels,
                2
              );
            } else if (variant == 3) {
              ongoing = minDistributeAssign(
                ongoing.data,
                ongoing.teams,
                "Gender",
                womenLabels,
                3
              );
            }
            break;
          case "UR":
            ongoing = minDistributeAssign(
              ongoing.data,
              ongoing.teams,
              "UR",
              ["Underrepresented"],
              2
            );
            break;
          case "Military Status":
            allowedValues = ["Air Force", "Army", "Marine Corps", "Navy"];
            ongoing = distributeMinLabelAssign(
              ongoing.data,
              ongoing.teams,
              "Military Status",
              allowedValues,
              true,
              [...allowedValues]
            );
            break;
          case "Citizenship Status":
            allowedValues = ["FN", "US"];
            ongoing = distributeMinLabelAssign(
              ongoing.data,
              ongoing.teams,
              "Citizenship Status",
              allowedValues,
              false,
              []
            );
            break;
          case "PQT":
            allowedValues = ["P", "Q", "T"];
            ongoing = distributeMinLabelAssign(
              ongoing.data,
              ongoing.teams,
              "PQT",
              allowedValues,
              false,
              []
            );
            break;
          case "Primary Citizenship":
            allowedValues = shuffledData["Primary Citizenship"].unique();
            ongoing = distributeMinLabelAssign(
              ongoing.data,
              ongoing.teams,
              "Primary Citizenship",
              allowedValues,
              false,
              []
            );
            break;
          case "Industry":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "Industry"
            );
            break;
          case "Employer":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "Employer"
            );
            break;
          case "UG School Name":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "UG School Name"
            );
            break;
          case "UG School Major":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "UG School Major"
            );
            break;
          case "Ethnicity":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "Ethnicity"
            );
            break;
          case "Function":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "Function"
            );
            break;
          case "UG School Country":
            ongoing = fillRemainingAssign(
              ongoing.data,
              ongoing.teams,
              "UG School Country"
            );
            break;
          case "Timezone":
            ongoing = assignNoMoreThan(ongoing.data, ongoing.teams, "Timezone", 2);
            break;
          default:
            ongoing = ongoing;
            break;
        }
      }

      if (ongoing.data.shape[0] != 0) {
        ongoing = assignRemaining(ongoing.data, ongoing.teams);
      }
      assert(ongoing.data.shape[0] == 0, "Data not fully assigned");
      let teamSizes = getTeamSizes(ongoing.teams);
      assert(teamSizes.every((size) => size <= MAX_TEAM_SIZE), "Team size too large");
      assert(teamSizes.reduce((partial, size) => partial + size, 0) == shuffledData.shape[0], "Data not fully assigned");
      return { teams: ongoing.teams, seed: seed };
    };

    /**
     * Runs nIterations number of iterations and returns the best teams from input data. Updates the state variables of the teams and triggers a rerender to display the teams
     *
     * @param {dfd.DataFrame} data
     * @param {int} nIterations
     */
    const findBestTeams = async (data, nIterations) => {
      try {
        dataValidation(data);
      } catch (error) {
        return;
      }
      let bestTeams = [];
      let bestScore = Infinity;
      let bestSeed = 0;
      let addedStep = 100 / nIterations;
      const delay = () => new Promise((resolve) => setTimeout(resolve, 0));
      let progress = 0;
      for (let i = 0; i < nIterations; i++) {
        let iterResult = await oneIteration(data);
        let score = await scoreIteration(iterResult.teams);
        if (score < bestScore) {
          bestScore = score;
          bestTeams = iterResult.teams;
          bestSeed = iterResult.seed;
        }
        progress += addedStep;
        setNow(progress);
        await delay();
      }
      updateTeams(bestTeams);
      // console.log("max team size:", MAX_TEAM_SIZE);
      // console.log("weights:", WEIGHTS);
      console.log("final score:", bestScore);
      console.log("best seed:", bestSeed);
      console.log(
        "rankings:",
        rankings.map((rank) => rank.colLabel)
      );
      setTimeout(() => jumpTo("display"), 2000);
    };

    if (!afterRender) return;
    // here DOM is loaded and you can query DOM elements
    findBestTeams(emba, NUM_ITERATIONS);
    setAfterRender(false);
  }, [afterRender]);

  useEffect(() => {
    setAfterRender(true); // (1) will be called after DOM rendered
  }, [rerender]);

  return (
    <>
      <style type="text/css">
        {`
        .bg-cal {
            background-color: #003262;
            color: white;
        }
        `}
      </style>
      <div className={classnames("text-center")}>
        <p>Compiling the teams...</p>
        <p>
          Please take note that depending on the size of your data, this process
          may take anywhere from 5-20 minutes.
        </p>
        <ProgressBar
          animated
          variant="cal"
          now={now}
          label={`${Math.round(now)}%`}
          className="my-4"
        />
      </div>
    </>
  );
}

export default ProcessData;
