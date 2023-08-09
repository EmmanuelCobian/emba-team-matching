import React, { useState, useEffect } from 'react'
import { Container, Button, Row, Col } from 'react-bootstrap'
import Table from 'react-bootstrap/Table'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useCSVReader } from 'react-papaparse'
import classnames from 'classnames'
import styles from '../styles/Master.module.css'
import * as dfd from 'danfojs'

export default function Master() {
    const [inputData, setInputData] = useState({
        data: [],
        errors: [],
        meta: [],
    })
    const [finalTeams, setTeams] = useState([])
    const [rankings, setRankings] = useState([])
    const [numTeams, setNumTeams] = useState()
    const [step, setStep] = useState('file')
    const [errMsg, setErrMsg] = useState('')

    const updateInputData = (results) => {
        setInputData(previousState => {
            return { ...previousState, data: results.data}
        })
    }

    const updateTeams = (teams) => {
        setTeams(teams)
    }

    const updateNumTeams = (value) => {
        setNumTeams(value)
    }

    const updateRankings = (ranks) => {
        setRankings(ranks)
    }

    function jumpTo(nextStage) {
        setStep(nextStage)
    }

    function catchError(nextStage, error) {
        setStep(nextStage)
        setErrMsg(error)
    }

    function handleChange() {
        switch (step) {
            case 'file':
                return <FileUpload updateInputData={updateInputData} jumpTo={jumpTo}/>
            case 'params':
                return <GetParams dataLen={inputData.data.length} updateNumTeams={updateNumTeams} updateRankings={updateRankings} jumpTo={jumpTo}/>
            case 'process':
                return <ProcessData inputData={inputData} numTeams={numTeams} rankings={rankings} updateTeams={updateTeams} jumpTo={jumpTo} catchError={catchError}/>
            case 'display':
                return <DisplayResults inputData={finalTeams} jumpTo={jumpTo}/>
            case 'error':
                return <ErrorCatch jumpTo={jumpTo} category={errMsg}/>
            default:
                return <p>default content</p>
        }
    }

    return (
        <div>
            {handleChange()}
        </div>
    )
}

function ErrorCatch({ jumpTo, category }) {
    let colName = ''
    let allowedTypes = ''
    if (category == 'Gender') {
        colName = 'Gender'
        allowedTypes = 
        <Row>
            <Col>
                <li>Woman</li>
            </Col>
            <Col>
                <li>Man</li>
            </Col>
        </Row>
    } else if (category == 'Military') {
        colName = 'Military Status'
        allowedTypes = 
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
    } else if (category == 'Internationals') {
        colName = 'Citizen Status'
        allowedTypes = 
        <Row>
            <Col>
                <li>US</li>
                <li>PR</li>
            </Col>
            <Col>
                <li>FN</li>
                <li>Empty cell</li>
            </Col>
        </Row>
    } else if (category == 'Industries') {
        colName = 'Industry'
        allowedTypes = 
        <Row>
            <Col>
                <li>Any non-numerical value</li>
            </Col>
            <Col>
                <li>Empty cell</li>
            </Col>
        </Row>
    }
    return (
        <div>
            <p className='text-center'>An error was encountered with the <span className='fw-bold'>{category}</span> column. Please double check that your .csv file aligns with the requirements.</p>
            <Table hover bordered responsive striped className='w-75 mx-auto'>
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
                            <ul>
                                {allowedTypes}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <div className='text-center'>
                <Button className={classnames(styles.btn, 'mb-3')} onClick={() => jumpTo('file')}>Start Again</Button>
            </div>
        </div>
    )
}

function FileUpload({ updateInputData, jumpTo }) {
    const { CSVReader } = useCSVReader()
    const config = {header: true}

    return (
        <>
            <p className={classnames('text-center')}>Start by uploading a .csv file with the people you want to match</p>
            <CSVReader config={config} onUploadAccepted={(results) => {
                for (let i = 0; i < results.errors.length; i++) {
                    const toRemove = results.errors[i][0].row
                    results.data.splice(toRemove, 1)
                }
                updateInputData(results)
                jumpTo('params')
            }}>
                {({
                    getRootProps,
                    acceptedFile,
                    ProgressBar,
                    getRemoveFileProps,
                }) => (
                    <Container>
                        <div className={styles.csvReader}>
                            <Button type='button' {...getRootProps()} className={classnames('mb-1', styles.btn)}>Browse File</Button>
                            <div className={styles.acceptedFile}>
                                {acceptedFile && acceptedFile.name}
                            </div>
                        </div>
                        <ProgressBar className={styles.progressBarBackgroundColor}/>
                    </Container>
                )}
            </CSVReader>
        </>
    )
}

function GetParams({ dataLen, updateNumTeams, updateRankings, jumpTo }) {
    const rankings = [
        {item:'Gender', icon:'bi bi-gender-ambiguous'}, {item:'Military', icon:'bi bi-wrench'}, {item:'Citizen Status', icon:'bi bi-flag'}, {item:'Industry', icon:'bi bi-briefcase'}, {item:'Age', icon:'bi bi-universal-access'},]
    const [finalRankings, setFinalRankings] = useState(rankings)
    const [numTeams, setNumTeams] = useState('')
    const onInput = ({target: {value}}) => (setNumTeams(value))
    const handleSubmit = e => {
        e.preventDefault()
        setNumTeams()
        updateRankings(finalRankings)
        updateNumTeams(parseInt(numTeams))
        jumpTo('process')
    }

    function handleOnDragEnd(result) {
        if (!result.destination) {
            return
        }
        const items = Array.from(finalRankings)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setFinalRankings(items)
    }

    return (
        <>
            <p className={classnames('text-start')}>Please complete the following information</p>
            <Form onSubmit={handleSubmit}> 
                <Form.Group>
                    <Form.Label>Drag and drop the rankings with highest priority at the top and lowest at the bottom</Form.Label>
                    <DragDropContext onDragEnd={handleOnDragEnd} >
                        <Droppable droppableId='rankings' >
                            {(provided) => (
                                <ListGroup className={classnames('rankings', 'mb-4', 'w-50')} {...provided.droppableProps} ref={provided.innerRef}>
                                    {finalRankings.map(({item, icon}, index) => {
                                        return (
                                            <Draggable key={item} draggableId={item} index={index}>
                                                {(provided) => (
                                                    <ListGroup.Item ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                        <i className={classnames(icon, 'me-2')}/>{item}
                                                    </ListGroup.Item>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </ListGroup>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Number of Groups</Form.Label>
                    <Form.Control required type='number' onChange={onInput} value={numTeams} min={1} max={dataLen} className={classnames('w-25', 'mb-3')}/>
                </Form.Group>
                <Button type='submit' className={classnames('mb-3', styles.btn)}>Continue</Button>
            </Form>
        </>
    )
}

function ProcessData({ inputData, numTeams, rankings, updateTeams, jumpTo, catchError }) {
    let emba = new dfd.DataFrame(inputData.data)
    const MAX_TEAM_SIZE = Math.floor(emba.shape[0] / numTeams)
    const [now, setNow] = useState(0)
    const [rerender, setRerender] = useState(true)
    const [afterRender, setAfterRender] = useState(false)

    function handleAppend(data, row, teamNum) {
        let newData = {'Team':[teamNum]}
        let newRow = new dfd.DataFrame(newData)
        let rowCols = row.columns
        for (let i = 0; i < rowCols.length; i++) {
            let col = rowCols[i]
            if (col == 'Team') continue
            newRow = newRow.addColumn(col, row[col])
        }
        data = data.append(newRow, [data.shape[0]])
        let firstRow = data.iloc({ rows:[0] })
        let nonNaCount = firstRow.count()
        if (nonNaCount.values[0] == 0) {
            data = data.drop({ index:[0] })
            data.resetIndex({ inplace:true })
        }
        return data
    }

    function argMax(arr) {
        return arr.reduce((iMax, x, i, a) => x > a[iMax] ? i : iMax, 0)
    }

    function argMin(arr) {
        return arr.reduce((iMax, x, i, a) => x < a[iMax] ? i : iMax, 0)
    }

    function getNumVetsPerTeam(teams, vetOptions) {
        let allowedValues = vetOptions.slice()
        allowedValues.push(...[null, ''])
        let result = []
        for (let i = 0; i < teams.length; i++) {
            let vets = teams[i]['Military Status'].values
            let numVets = 0
            for (let j = 0; j < vets.length; j++) {
                let vet = vets[j]
                if (vetOptions.includes(vet)) {
                    numVets += 1
                } else if (!allowedValues.includes(vet)) {
                    throw new Error('not a valid vet status')
                }
            }
            result.push(numVets)
        }
        return result
    }

    function getNumIntPerTeam(teams, internationalStatus) {
        const allowedValues = ['', 'FN', 'US', 'PR', null]
        let result = []
        for (let i = 0; i < teams.length; i++) {
            const citizenStatus = teams[i]['Citizen Status'].values
            let numInt = 0
            for (let j = 0; j < citizenStatus.length; j++) {
                let status = citizenStatus[j]
                if (status == internationalStatus) {
                    numInt += 1
                } else if (!allowedValues.includes(status)) {
                    throw new Error('citizen status error')
                }
            }
            result.push(numInt)
        }
        return result
    }

    function getNumWomenPerTeam(teams) {
        let result = []
        for (let i = 0; i < teams.length; i++) {
            const genders = teams[i]['Gender'].values
            let numWomen = 0
            for (let j = 0; j < genders.length; j++) {
                let gender = genders[j]
                if (gender == 'Woman') {
                    numWomen += 1
                } else if (gender != 'Man' && gender != null) {
                    throw new Error('wrong inputs')
                }
            }
            result.push(numWomen)
        }
        return result
    }

    function getIndustriesPerTeam(teams) {
        let result = []
        for (let i = 0; i < teams.length; i++) {
            let industries = teams[i]['Industry'].values
            result.push(industries)
        }

        return result
    }

    function getDupes(team, industry) {
        let teamSeries = new dfd.Series(team)
        let boolMask = teamSeries.eq(industry)
        return boolMask.sum()
    }

    function assignWomen(data, teams) {
        /* 
        - min number of women per team = 2
        - if each team already has 2 women, go back to the start and assign 1 more iteratively until there's no more
        - if there's only 1 women in a team, assign that women to the next team with the least amount of women
        */

       let teamIndex = 0
       let minNumWomen = 2
       let numWomen = getNumWomenPerTeam(teams)
       let numRows = data.shape[0]
       data = data.resetIndex()

       for (let i = 0; i < numRows; i++) {
        let row = data.loc({rows:[i]})
        let gender = row['Gender'].iat(0)
        if (gender != 'Woman') {
            if (gender != 'Man') {
                throw new Error('Gender error')
            }
            continue
        }

        let startIndex = teamIndex
        while ((numWomen[teamIndex] >= minNumWomen) || 
                (((teams[teamIndex].shape[0] >= MAX_TEAM_SIZE) && ((numWomen[teamIndex] != 1) && (teams[teamIndex].count().values[0] > 0))))) {
            teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0 

            if (startIndex == teamIndex) {
                minNumWomen += 1
                teamIndex = argMin(numWomen)
                break
            }
        }

        numWomen[teamIndex] += 1
        teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1)
        data = data.drop({ index:[i] })
    }

    if (numWomen[teamIndex] == 1) {
        let lastPersonAdded = teams[teamIndex].iloc({ rows:[teams[teamIndex].shape[0] - 1] })
        teams[teamIndex] = teams[teamIndex].drop({ index:[teams[teamIndex].shape[0] - 1] })
        numWomen[teamIndex] -= 1

        let nWomenFilter = []
        for (let i = 0; i < teams.length; i++) {
            if (numWomen[i] <= 1) {
                nWomenFilter.push(Infinity)
            } else {
                nWomenFilter.push(numWomen[i])
            }
        }
        teamIndex = argMin(nWomenFilter)
        teams[teamIndex] = handleAppend(teams[teamIndex], lastPersonAdded, teamIndex + 1)
    }
        return {data:data, teams:teams}
    }

    function assignVets(data, teams) {
        /* 
        - Military students should be separated as much as possible, including their branch
        - assign them to a team that isn't full and doesn't already have a vet
        - if all teams have a vet, assign them to the team that has the least number of vets
        */
        const vetStatusOptions = ['Air Force', 'Army', 'Marine Corps', 'Navy']
        let numVets = getNumVetsPerTeam(teams, vetStatusOptions)
        let minVetNum = 1
        let teamIndex = 0
        let numRows = data.shape[0]
        data = data.resetIndex()

        for (let i = 0; i < numRows; i++) {
            let row = data.loc({ rows:[i] })
            let militaryStatus = row['Military Status'].iat(0)
            if (!vetStatusOptions.includes(militaryStatus)) {
                if (militaryStatus != '') {
                    throw new Error('military status error')
                }
                continue
            }

            let startIndex = teamIndex
            // TODO: look into the edge cases in this loop
            while ((numVets[teamIndex] >= minVetNum) || (teams[teamIndex]['Military Status'].values.includes(militaryStatus)) || ((teams[teamIndex].shape[0] >= MAX_TEAM_SIZE) && (teams[teamIndex].count().values[0] > 0))) {
                teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0
                if (startIndex == teamIndex) {
                    minVetNum++
                    let noDupeTeams = []
                    for (let j = 0; j < teams.length; j++) {
                        let teamMilitary = teams[j]['Military Status'].values
                        if (!teamMilitary.includes(militaryStatus)) {
                            noDupeTeams.push(numVets[j])
                        } else {
                            noDupeTeams.push(Infinity)
                        }
                    }
                    teamIndex = noDupeTeams.length > 0 ? argMin(noDupeTeams) : argMin(numVets)
                    break
                }
            }

            numVets[teamIndex] += 1
            teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1)
            data = data.drop({ index:[i] })
        }
        return {data:data, teams:teams}
    }

    function assignInternationals(data, teams) {
        /* 
        - spread out the internationals as much as possible
        - take note of the current num of domestic and international in each group
        - cycle through the groups, checking for a minimum number of international students
        - this can or cannot assign the remaining people. Depending on the number of international students left
        */
       const internationalStatus = 'FN'
       const allowedValues = ['FN', 'US', 'PR', '']
       let numInternationals = getNumIntPerTeam(teams, internationalStatus)
       let minInternationals = 1
       let teamIndex = 0
       let numRows = data.shape[0]
       data = data.resetIndex()

       for (let i = 0; i < numRows; i++) {
        let row = data.loc({ rows:[i] })
        let citizenStatus = row['Citizen Status'].iat(0)
        if (citizenStatus != internationalStatus) {
            if (!allowedValues.includes(citizenStatus)) {
                throw new Error('citizen status error')
            }
            continue
        }

        let startIndex = teamIndex
        while ((numInternationals[teamIndex] >= minInternationals) 
                || ((teams[teamIndex].shape[0] >= MAX_TEAM_SIZE)) && (teams[teamIndex].count().values[0] > 0)) {
            teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0
            if (startIndex == teamIndex) {
                let minFN = Infinity
                for (let j = 0; j < teams.length; j++) {
                    if ((numInternationals[j] < minFN) && (teams[j].shape[0] < MAX_TEAM_SIZE)) {
                        minFN = numInternationals[j]
                        teamIndex = j
                    }
                }
                minInternationals += 1
                break
            }
        }
        numInternationals[teamIndex] += 1
        teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1)
        data = data.drop({ index:[i] })
       }

       return {data:data, teams:teams}
    }

    function assignIndustries(data, teams) {
        /* 
        - make note of what industries are already in the group
        - look at the next applicant and assign them to a group that doesn't already have their industry (if there's space)
        - if there's no team that has different industries, assign them to a team that has the last number of their industry
        - this will assign any remaining people
        */
        let teamIndex = 0
        let teamIndustries = getIndustriesPerTeam(teams)
        let numRows = data.shape[0]
        let teamSize = teams[teamIndex].shape[0]
        data = data.resetIndex()

        for (let i = 0; i < numRows; i++) {
            let row = data.loc({ rows:[i] })
            let industry = row['Industry'].iat(0)
            
            let minDupeTeamIndex = teamIndex
            let minDupeTeamSize = teamSize
            let minDupes = ((teamIndustries[teamIndex]) && (teamIndustries[teamIndex].length > 0)) ? getDupes(teamIndustries[teamIndex], industry) : Infinity
            
            let startIndex = teamIndex
            while ((teamIndustries[teamIndex].includes(industry)) 
                    || ((teamSize >= MAX_TEAM_SIZE)) && (teams[teamIndex].count().values[0] > 0)) {
                teamIndex = teamIndex + 1 < teams.length ? teamIndex + 1 : 0
                teamSize = teams[teamIndex].shape[0]
                let dupes = getDupes(teamIndustries[teamIndex], industry)

                if ((dupes <= minDupes) && (teamSize < minDupeTeamSize) && (teamSize <= MAX_TEAM_SIZE)) {
                    minDupes = dupes
                    minDupeTeamIndex = teamIndex
                    minDupeTeamSize = teamSize
                }
                if (teamIndex == startIndex) {
                    // handle the edge case where the team we wanna add this person to has the smallest number of duplicates but we weren't able to find
                    // another team that has the same, or fewer, dupes and with a smaller team size, AND the min dupe team index is alreacy full
                    // assign this person to the smallest team
                    if (minDupeTeamSize >= MAX_TEAM_SIZE) {
                        teamIndex = argMin(teams.map((team) => (team.shape[0])))
                    } else {
                        teamIndex = minDupeTeamIndex
                    }
                    break
                }
            }

            if (teamIndustries[teamIndex][0] == null) {
                teamIndustries[teamIndex] = [industry]
            } else {
                teamIndustries[teamIndex] = teamIndustries[teamIndex].concat([industry])
            }
            teams[teamIndex] = handleAppend(teams[teamIndex], row, teamIndex + 1)
            teamSize = teams[teamIndex].shape[0]
            data = data.drop({ index:[i] })
        }

        return {data:data, teams:teams}
    }

    useEffect(() => {
        function scoreOneTeam(team, weights) {
            if (team.count().values[0] == 0) {
                return 0
            }
            let genders = team['Gender']
            let vets = team['Military Status']
            let industries = team['Industry']
            let age = team['Age']
            let internationals = team['Citizen Status'].eq('FN')
    
            let numWomen = genders.eq('Woman').sum()
            let numVets = vets.unique().shape[0]
            let numDiffIndustries = industries.unique().shape[0]
            let medianAge = age.median()
            let numInternationals = internationals.sum()
            
            let score = (numWomen * weights[0]) + (numInternationals * weights[1]) + (numVets * weights[2]) + (numDiffIndustries * weights[3]) + (medianAge * weights[4])
            for (let i = 0; i < rankings.length; i++) {
                let rank = rankings[i].item
                let weight = weights[i]
                if (rank == 'Gender') {
                    score += numWomen * weight
                } else if (rank == 'Military') {
                    score += numVets * weight
                } else if (rank == 'Citizen Status') {
                    score += numInternationals * weight
                } else if (rank == 'Industry') {
                    score += numDiffIndustries * weight
                } else if (rank == 'Age') {
                    score += medianAge * weight
                } else {
                    score += 0
                }
            }
            return score
        }
        
        async function scoreIteration(teams) {
            // given one iteration, find a score and only keep the best one
            // the objective function is minimizing the difference in scores between teams
            const weights = [0.4, 0.3, 0.2, 0.07, 0.03]
            let scores = []
            teams.map((team) => (
                scores.push(scoreOneTeam(team, weights))
            ))
            let allCombs = scores.map(function(item, i, arr) {
                var tmp = arr.map(function(_item) { if( item != _item) return [item, _item]})
                return tmp.splice(tmp.indexOf(undefined),1), tmp
            })
            let scorePairs = []
            for (let i = 0; i < allCombs.length; i++) {
                let pair = allCombs[i]
                if (!pair.includes(undefined)) {
                    scorePairs = pair
                    break
                }
            }
            let differences = scorePairs.map((pair) => (
                Math.abs(pair[0] - pair[1])
            ))
            let result = Math.max(...differences)
            return result
        }

        async function oneIteration(data) {
            let teams = new Array(numTeams)
            let cols = ['Team']
            let numCols = cols.push(...data.columns)
            teams.fill(new dfd.DataFrame([Array(numCols).fill(null)], {columns: cols}))
            // army problem: seed, 0.005857852797082286, teams, 7, rankings, default
            let seed = Math.random()
            let shuffledData = await data.sample(data.shape[0], {seed:seed})
            let ongoing = {data:shuffledData, teams:teams}
            for (let i = 0; i < rankings.length; i++) {
                let rank = rankings[i].item
                if (rank == 'Gender') {
                    try {
                        ongoing = assignWomen(ongoing.data, ongoing.teams)
                    } catch (err) {
                        catchError('error', 'Gender')
                        return
                    }
                } else if (rank == 'Military') {
                    try {
                        ongoing = assignVets(ongoing.data, ongoing.teams)
                    } catch (err) {
                        catchError('error', 'Military')
                        return
                    }
                } else if (rank == 'Citizen Status') {
                    try {
                        ongoing = assignInternationals(ongoing.data, ongoing.teams)
                    } catch (err) {
                        catchError('error', 'Internationals')
                        return
                    }
                } else if (rank == 'Industry') {
                    try {
                        ongoing = assignIndustries(ongoing.data, ongoing.teams)
                    } catch (err) {
                        catchError('error', 'Industries')
                        return
                    }
                } else {
                    ongoing = ongoing
                }
            }
            return {teams:ongoing.teams, seed:seed}
        }

        async function findBestTeams(data, nIterations) {
           console.log('max team size:', MAX_TEAM_SIZE)
            let bestTeams = []
            let bestScore = Infinity
            let bestSeed = 0
            let addedStep = 100 / nIterations
            const delay = () => new Promise((resolve) => setTimeout(resolve, 0))
            let progress = 0
            for (let i = 0; i < nIterations; i++) {
                let iterResult = await oneIteration(data)
                if (!iterResult) {
                    return
                }
                let score = await scoreIteration(iterResult.teams)
                if (score < bestScore) {
                    bestScore = score
                    bestTeams = iterResult.teams
                    bestSeed = iterResult.seed
                }
                progress += addedStep
                setNow(progress)
                await delay()
            }
            updateTeams(bestTeams)
            console.log('final score:', bestScore)
            console.log('best seed:', bestSeed)
            console.log('rankings:', rankings.map((rank) => rank.item))
            setTimeout(() => jumpTo('display'), 2000)
        }

        if (!afterRender) return;
        // here DOM is loaded and you can query DOM elements
        findBestTeams(emba, 1)
        setAfterRender(false)
    }, [afterRender])
     
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
            <div className={classnames('text-center')}>
                <p>working on the results</p>
                <ProgressBar animated variant="cal" now={now} label={`${Math.round(now)}%`} className='my-4'/>
            </div>
        </>
    )
}

function DisplayResults({ inputData, jumpTo }) {
    function downloadResults(results, fileName) {
        dfd.toCSV(results, {fileName: fileName, download: true})
    }

    return (
        <>
            <div className='text-center'>
                <p>Here are the results!</p>
                <Button className={classnames('mb-3', styles.btn)} onClick={() => downloadResults(dfd.concat({ dfList: inputData, axis:0 }), "teamMatchingResults")}>Download Results</Button>
                <Button onClick={() => jumpTo('file')} className={classnames('mb-3', 'ms-2', styles.btn)}>Start Over</Button>
            </div>
            <Tabs
                defaultActiveKey='1'
                className={classnames('mb-3')}
                variant='underline'
                justify
            >
                {inputData.map((team, index) => {
                    return (
                        <Tab eventKey={index + 1} title={`Team ${index + 1}`} key={index}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        {team.columns.map((col) => {
                                            return <th key={col}>{col}</th>
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dfd.toJSON(team, {format: 'column'}).map((oneRow, index) => {
                                        return (
                                            <tr key={index}>
                                                {Object.keys(oneRow).map((col) => {
                                                    return <td key={String(index) + String(col)}>{oneRow[col]}</td>
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </Tab>
                    )
                })}
            </Tabs>
        </>
    )
}
