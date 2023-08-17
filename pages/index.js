import Head from 'next/head'
import Link from 'next/link'
import { Container, Row, Col, Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import classnames from 'classnames'
import styles from '../styles/Home.module.css'
import Layout from '../components/layout'
import Master from '../components/master'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Team Matching</title>
      </Head>

      <section id='home' className={styles.home}>
        <Container className={styles.homeText}>
          <h3>Team Matching Made Simple</h3>
          <Button className={styles.mainBtn}><a href='#get-started' className='text-decoration-none text-white'>Get Started</a></Button>
        </Container>
      </section>

      <section id='about' className='my-4'>
        <Container>
          <h2>About</h2>
          <p> Finding the optimal team configuration can be a challenging task. This website uses an approximation algorithm to match teams based on ranked criteria specified by you, the user. This ensures a high-quality solution that closely matches your priorities by efficiently analyzing a wide range of potential team combinations. This algorithm gets as close as possible, within the rankings provided by the user, to the optimal solution. This data-driven approach takes the guesswork out of team formation, while still allowing you to customize the process based on what matters most to you.
          </p>
        </Container>
      </section>

      <section id='instructions' className='my-4'>
        <Container>
          <h2>Instructions</h2>
          <Row>
            <Col md className='my-2'>
              <Card>
                <div className={classnames('mt-2', styles.cardIcon)}><i className='bi bi-upload'></i></div>
                <Card.Body className='text-center'>
                  <Card.Title>Upload Data</Card.Title>
                  <Card.Text>
                    Start by uploading your .csv file containing student data. For more information on what your file should look like on upload, check out the <Link href='documentation'>documentation</Link>.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md className='my-2'>
              <Card>
                <div className={classnames('mt-2', styles.cardIcon)}><i className='bi bi-ui-checks'></i></div>
                <Card.Body className='text-center'>
                  <Card.Title>Provide Details</Card.Title>
                  <Card.Text>
                    You will be asked to provide a ranking of criteria and the number of teams you would like to create. Adjust the parameters to what best suits your needs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md className='my-2'>
              <Card>
              <div className={classnames('mt-2', styles.cardIcon)}><i className='bi bi-hand-thumbs-up'></i></div>
                <Card.Body className='text-center'>
                  <Card.Title>Get Results</Card.Title>
                  <Card.Text>
                    View and download the results. You can also restart the process and try again with different data, team sizes, or criteria.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section id='get-started'>
        <Container>
          <h2 >Get Started</h2>
          <Master />
        </Container>
      </section>
      
    </Layout>
  )
}
