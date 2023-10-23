import React, { useState, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import classnames from "classnames";
import * as dfd from "danfojs";

function ProcessData({
  inputData,
  numTeams,
  rankings,
  updateTeams,
  jumpTo,
  catchError,
}) {
  let emba = new dfd.DataFrame(inputData.data);
  const MAX_TEAM_SIZE = Math.floor(emba.shape[0] / numTeams);
  const [now, setNow] = useState(0);
  const [rerender, setRerender] = useState(true);
  const [afterRender, setAfterRender] = useState(false);

  function handleAppend(data, row, teamNum) {
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
  }

  function argMax(arr) {
    return arr.reduce((iMax, x, i, a) => (x > a[iMax] ? i : iMax), 0);
  }

  function argMin(arr) {
    return arr.reduce((iMax, x, i, a) => (x < a[iMax] ? i : iMax), 0);
  }

  function getNumVetsPerTeam(teams, vetOptions) {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      let vets = teams[i]["Military Status"].values;
      let numVets = 0;
      for (let j = 0; j < vets.length; j++) {
        let vet = vets[j];
        if (vetOptions.includes(vet)) {
          numVets += 1;
        }
      }
      result.push(numVets);
    }
    return result;
  }

  function getNumIntPerTeam(teams, internationalStatus) {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      const citizenStatus = teams[i]["Citizenship Status"].values;
      let numInt = 0;
      for (let j = 0; j < citizenStatus.length; j++) {
        let status = citizenStatus[j];
        if (status == internationalStatus) {
          numInt += 1;
        }
      }
      result.push(numInt);
    }
    return result;
  }

  function getNumWomenPerTeam(teams) {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      const genders = teams[i]["Gender"].values;
      let numWomen = 0;
      for (let j = 0; j < genders.length; j++) {
        let gender = genders[j];
        if (gender == "Woman") {
          numWomen += 1;
        }
      }
      result.push(numWomen);
    }
    return result;
  }

  function getIndustriesPerTeam(teams) {
    let result = [];
    for (let i = 0; i < teams.length; i++) {
      let industries = teams[i]["Industry"].values;
      result.push(industries);
    }

    return result;
  }

  function getDupes(team, industry) {
    let teamSeries = new dfd.Series(team);
    let boolMask = teamSeries.eq(industry);
    return boolMask.sum();
  }

  function assignWomen(data, teams) {
    /* 
          - min number of women per team = 2
          - if each team already has 2 women, go back to the start and assign 1 more iteratively until there's no more
          - if there's only 1 women in a team, assign that women to the next team with the least amount of women
      */

    let teamIndex = 0;
    let minNumWomen = 2;
    let numWomen = getNumWomenPerTeam(teams);
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let gender = row["Gender"].iat(0);
      if (gender != "Woman") {
        continue;
      }

      let startIndex = teamIndex;
      while (
        numWomen[teamIndex] >= minNumWomen ||
        (teams[teamIndex].shape[0] >= MAX_TEAM_SIZE &&
          numWomen[teamIndex] != 1 &&
          teams[teamIndex].count().values[0] > 0)
      ) {
        teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0;

        if (startIndex == teamIndex) {
          minNumWomen += 1;
          teamIndex = argMin(numWomen);
          break;
        }
      }

      numWomen[teamIndex] += 1;
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      data = data.drop({ index: [i] });
    }

    if (numWomen[teamIndex] == 1) {
      let lastPersonAdded = teams[teamIndex].iloc({
        rows: [teams[teamIndex].shape[0] - 1],
      });
      teams[teamIndex] = teams[teamIndex].drop({
        index: [teams[teamIndex].shape[0] - 1],
      });
      numWomen[teamIndex] -= 1;

      let nWomenFilter = [];
      for (let i = 0; i < teams.length; i++) {
        if (numWomen[i] <= 1) {
          nWomenFilter.push(Infinity);
        } else {
          nWomenFilter.push(numWomen[i]);
        }
      }
      teamIndex = argMin(nWomenFilter);
      teams[teamIndex] = handleAppend(
        teams[teamIndex],
        lastPersonAdded,
        teamIndex + 1
      );
    }
    return { data: data, teams: teams };
  }

  function assignVets(data, teams) {
    /* 
          - Military students should be separated as much as possible, including their branch
          - assign them to a team that isn't full and doesn't already have a vet
          - if all teams have a vet, assign them to the team that has the least number of vets
          */
    const vetStatusOptions = ["Air Force", "Army", "Marine Corps", "Navy"];
    let numVets = getNumVetsPerTeam(teams, vetStatusOptions);
    let minVetNum = 1;
    let teamIndex = 0;
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let militaryStatus = row["Military Status"].iat(0);
      if (!vetStatusOptions.includes(militaryStatus)) {
        continue;
      }

      let startIndex = teamIndex;
      // TODO: look into the edge cases in this loop
      while (
        numVets[teamIndex] >= minVetNum ||
        teams[teamIndex]["Military Status"].values.includes(militaryStatus) ||
        (teams[teamIndex].shape[0] >= MAX_TEAM_SIZE &&
          teams[teamIndex].count().values[0] > 0)
      ) {
        teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0;
        if (startIndex == teamIndex) {
          minVetNum++;
          let noDupeTeams = [];
          for (let j = 0; j < teams.length; j++) {
            let teamMilitary = teams[j]["Military Status"].values;
            if (!teamMilitary.includes(militaryStatus)) {
              noDupeTeams.push(numVets[j]);
            } else {
              noDupeTeams.push(Infinity);
            }
          }
          teamIndex =
            noDupeTeams.length > 0 ? argMin(noDupeTeams) : argMin(numVets);
          break;
        }
      }

      numVets[teamIndex] += 1;
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      data = data.drop({ index: [i] });
    }
    return { data: data, teams: teams };
  }

  function assignInternationals(data, teams) {
    /* 
          - spread out the internationals as much as possible
          - take note of the current num of domestic and international in each group
          - cycle through the groups, checking for a minimum number of international students
          - this can or cannot assign the remaining people. Depending on the number of international students left
          */
    const internationalStatus = "FN";
    let numInternationals = getNumIntPerTeam(teams, internationalStatus);
    let minInternationals = 1;
    let teamIndex = 0;
    let numRows = data.shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let citizenStatus = row["Citizenship Status"].iat(0);
      if (citizenStatus != internationalStatus) {
        continue;
      }

      let startIndex = teamIndex;
      while (
        numInternationals[teamIndex] >= minInternationals ||
        (teams[teamIndex].shape[0] >= MAX_TEAM_SIZE &&
          teams[teamIndex].count().values[0] > 0)
      ) {
        teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0;
        if (startIndex == teamIndex) {
          let minFN = Infinity;
          for (let j = 0; j < teams.length; j++) {
            if (
              numInternationals[j] < minFN &&
              teams[j].shape[0] < MAX_TEAM_SIZE
            ) {
              minFN = numInternationals[j];
              teamIndex = j;
            }
          }
          minInternationals += 1;
          break;
        }
      }
      numInternationals[teamIndex] += 1;
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      data = data.drop({ index: [i] });
    }

    return { data: data, teams: teams };
  }

  function assignIndustries(data, teams) {
    /* 
          - make note of what industries are already in the group
          - look at the next applicant and assign them to a group that doesn't already have their industry (if there's space)
          - if there's no team that has different industries, assign them to a team that has the last number of their industry
          - this will assign any remaining people
          */
    let teamIndex = 0;
    let teamIndustries = getIndustriesPerTeam(teams);
    let numRows = data.shape[0];
    let teamSize = teams[teamIndex].shape[0];
    data = data.resetIndex();

    for (let i = 0; i < numRows; i++) {
      let row = data.loc({ rows: [i] });
      let industry = row["Industry"].iat(0);

      let minDupeTeamIndex = teamIndex;
      let minDupeTeamSize = teamSize;
      let minDupes =
        teamIndustries[teamIndex] && teamIndustries[teamIndex].length > 0
          ? getDupes(teamIndustries[teamIndex], industry)
          : Infinity;

      let startIndex = teamIndex;
      while (
        teamIndustries[teamIndex].includes(industry) ||
        (teamSize >= MAX_TEAM_SIZE && teams[teamIndex].count().values[0] > 0)
      ) {
        teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0;
        teamSize = teams[teamIndex].shape[0];
        let dupes = getDupes(teamIndustries[teamIndex], industry);

        if (
          dupes <= minDupes &&
          teamSize < minDupeTeamSize &&
          teamSize <= MAX_TEAM_SIZE
        ) {
          minDupes = dupes;
          minDupeTeamIndex = teamIndex;
          minDupeTeamSize = teamSize;
        }
        if (teamIndex == startIndex) {
          // handle the edge case where the team we wanna add this person to has the smallest number of duplicates but we weren't able to find
          // another team that has the same, or fewer, dupes and with a smaller team size, AND the min dupe team index is alreacy full
          // assign this person to the smallest team
          if (minDupeTeamSize > MAX_TEAM_SIZE) {
            teamIndex = argMin(teams.map((team) => team.shape[0]));
          } else {
            teamIndex = minDupeTeamIndex;
          }
          break;
        }
      }

      if (teamIndustries[teamIndex][0] == null) {
        teamIndustries[teamIndex] = [industry];
      } else {
        teamIndustries[teamIndex] = teamIndustries[teamIndex].concat([
          industry,
        ]);
      }
      teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1);
      teamSize = teams[teamIndex].shape[0];
      data = data.drop({ index: [i] });
    }

    return { data: data, teams: teams };
  }

  function assignTimeZones(data, teams) {
    return { data: data, teams: teams }
  }

  function assignDegreeMajors(data, teams) {
    return { data: data, teams: teams }
  }

  function dataValidation(data) {
    let uniqueValues;
    let allowedValues;
    let ranks = rankings.map((elm) => elm.item)

    // validate gender column
    if (ranks.includes('Gender')) {
      if (!data.columns.includes("Gender")) {
        catchError("error", "Gender");
        throw new Error("gender error");
      }
      uniqueValues = data["Gender"].unique();
      allowedValues = ["Man", "Woman"];
      checkValues(uniqueValues, allowedValues, "Gender");
    }

    // validate military column
    if (ranks.includes('Military Status')) {
      if (!data.columns.includes("Military Status")) {
        catchError("error", "Military Status");
        throw new Error("military error");
      }
      uniqueValues = data["Military Status"].unique();
      allowedValues = ["Army", "Air Force", "Navy", "Marine Corps", ""];
      checkValues(uniqueValues, allowedValues, "Military Status");
    }

    // validate internationals column
    if (ranks.includes('Citizenship Status')) {
      if (!data.columns.includes("Citizenship Status")) {
        catchError("error", "Citizenship Status");
        throw new Error("citizenship status error");
      }
      uniqueValues = data["Citizenship Status"].unique();
      allowedValues = ["FN", "US", "PR"];
      checkValues(uniqueValues, allowedValues, "Citizenship");
    }

    // validate industry column
    if (ranks.includes('Industry')) {
      if (!data.columns.includes("Industry")) {
        catchError("error", "Industry");
        throw new Error("industry error");
      }
    }

    //validate age column
    if (ranks.includes('Age')) {
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

    // validate time zones column
    if (ranks.includes('Time Zone')) {
      if (!data.columns.includes("Time Zone")) {
        catchError('error', 'Time Zone')
        throw new Error('time zone error')
      }
    }

    // validate degree major column
    if (ranks.includes("Degree Major")) {
      if (!data.columns.includes("Degree Major")) {
        catchError('error', 'Degree Major')
        throw new Error('degree major error')
      }
    }

    // make sure there isn't a column called "Team"
    if (data.columns.includes("Team")) {
      catchError("error", "Team");
      throw new Error("forbidden column");
    }

    // check that there aren't any # characters
  }

  function checkValues(values, allowedValues, category) {
    for (let i = 0; i < values.shape[0]; i++) {
      let value = values.iat(i);
      if (!allowedValues.includes(value)) {
        catchError("error", category);
        throw new Error(category + " error");
      }
    }
  }

  useEffect(() => {
    function scoreOneTeam(team, weights) {
      if (team.count().values[0] == 0) {
        return 0;
      }

      let numWomen = team["Gender"].eq("Woman").sum();
      let numVets = team["Military Status"].ne("").sum();
      let numDiffIndustries = team["Industry"].unique().shape[0];
      let medianAge = team["Age"].median();
      let numInternationals = team["Citizenship Status"].eq("FN").sum();

      let score = 0;
      for (let i = 0; i < rankings.length; i++) {
        let rank = rankings[i].item;
        let weight = weights[i];
        switch (rank) {
          case "Gender":
            score += numWomen * weight
          case "Military Status":
            score += numVets * weight
          case "Citizenship Status":
            score += numInternationals * weight 
          case "Industry":
            score += numDiffIndustries * weight
          case "Age":
            score += medianAge * weight
          case "Time Zone":
            score += 1
          case "Degree Major":
            score += 1
          default:
            score += 0
        }
      }
      return score;
    }

    async function scoreIteration(teams) {
      // given one iteration, find a score and only keep the best one
      // the objective function is minimizing the difference in scores between teams
      const weights = [0.4, 0.35, 0.15, 0.07, 0.03];
      let scores = [];
      teams.map((team) => scores.push(scoreOneTeam(team, weights)));
      let allCombs = scores.map(function (item, i, arr) {
        var tmp = arr.map(function (_item) {
          if (item != _item) return [item, _item];
        });
        return tmp.splice(tmp.indexOf(undefined), 1), tmp;
      });
      let scorePairs = [];
      for (let i = 0; i < allCombs.length; i++) {
        let pair = allCombs[i];
        if (!pair.includes(undefined)) {
          scorePairs = pair;
          break;
        }
      }
      let differences = scorePairs.map((pair) => Math.abs(pair[0] - pair[1]));
      let result = Math.max(...differences);
      return result;
    }

    async function oneIteration(data) {
      let teams = new Array(numTeams);
      let cols = ["Team"];
      let numCols = cols.push(...data.columns);
      teams.fill(
        new dfd.DataFrame([Array(numCols).fill(null)], { columns: cols })
      );
      // military army example: seed, 0.1172232770299626, teams, 7, rankings, default
      let seed = Math.random();
      let shuffledData = await data.sample(data.shape[0], { seed: seed });
      let ongoing = { data: shuffledData, teams: teams };
      for (let i = 0; i < rankings.length; i++) {
        let rank = rankings[i].item;
        switch (rank) {
          case "Gender":
            ongoing = assignWomen(ongoing.data, ongoing.teams)
          case "Military Status":
            ongoing = assignVets(ongoing.data, ongoing.teams)
          case "Citizen Status":
            ongoing = assignInternationals(ongoing.data, ongoing.teams)
          case "Industry":
            ongoing = assignIndustries(ongoing.data, ongoing.teams)
          case "Time Zone":
            ongoing = assignTimeZones(ongoing.data, ongoing.teams)
          case "Degree Major":
            ongoing = assignDegreeMajors(ongoing.data, ongoing.teams)
          default:
            ongoing = ongoing
        }
      }
      return { teams: ongoing.teams, seed: seed };
    }

    async function findBestTeams(data, nIterations) {
      try {
        dataValidation(data);
      } catch (error) {
        return;
      }
      // console.log("max team size:", MAX_TEAM_SIZE);
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
      console.log("final score:", bestScore);
      console.log("best seed:", bestSeed);
      console.log(
        "rankings:",
        rankings.map((rank) => rank.item)
      );
      setTimeout(() => jumpTo("display"), 2000);
    }

    if (!afterRender) return;
    // here DOM is loaded and you can query DOM elements
    findBestTeams(emba, 1);
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
          may take anywhere from 4-10 minutes.
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
