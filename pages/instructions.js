import Layout from '@/components/layout'
import { Container, Row, Col } from 'react-bootstrap'
import Table from 'react-bootstrap/Table'

export default function Instructions() {
    const requirements = [
        {name:'Gender', allowed:
        <Row>
            <Col><li>Woman</li></Col>
            <Col><li>Man</li></Col>
        </Row>},
        {name:'Military Status', allowed:
        <Row>
            <Col><li>Army</li><li>Air Force</li><li>Navy</li></Col>
            <Col><li>Marine Corps</li><li>Empty cell</li></Col>
        </Row>},
        {name:'Industry', allowed:
        <Row>
            <Col><li>Any non-numerical value</li></Col>
            <Col><li>Empty Cell</li></Col>
        </Row>},
        {name:'Citizen Status', allowed:
        <Row>
            <Col><li>US</li><li>PR</li></Col>
            <Col><li>FN</li></Col>
        </Row>},
        {name:'Age', allowed:
        <Row>
            <Col><li>Any numerical value</li></Col>
        </Row>},
    ]

    return (
        <Layout>
            <Container>
                <h3>Input Data Documentation</h3>
                <p className='my-3'>Below you'll find infomation on the required information your .csv file needs for the team matching process to run successfuly. All of the following requirements must be fufilled as described below for optimal results.</p>
                <Table hover bordered striped className='mb-5'>
                    <thead>
                        <tr>
                            <th>Column Name</th>
                            <th>Allowed Values</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requirements.map(req => (
                        <tr>
                            <td>{req.name}</td>
                            <td><ul className='my-0'>{req.allowed}</ul></td>
                        </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </Layout>
    )
}