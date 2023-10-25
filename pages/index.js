import Head from "next/head";
import Link from "next/link";
import { Container, Row, Col, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import classnames from "classnames";
import styles from "../styles/Home.module.css";
import Layout from "../components/layout";
import Master from "../components/master";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Team Matching</title>
      </Head>

      <section id="home" className={styles.home}>
        <Container className={styles.homeText}>
          <div className={styles.mainText}>
            <h3>Team Matching Made Simple</h3>
            <Button className={styles.mainBtn}>
              <a
                href="#get-started"
                className="text-decoration-none text-white"
              >
                Get Started
              </a>
            </Button>
          </div>
        </Container>
      </section>

      <section id="about" className="my-5">
        <Container>
          <h2>About</h2>
          <p>
            {" "}
            Finding the optimal team configuration can be a challenging task.
            This website uses an approximation algorithm to match teams based on
            ranked criteria specified by you, the user. This ensures a
            high-quality solution that closely matches your priorities by
            efficiently analyzing a wide range of potential team combinations.
            This algorithm gets as close as possible, within the rankings
            provided by the user, to the optimal solution. This data-driven
            approach takes the guesswork out of team formation, while still
            allowing you to customize the process based on what matters most to
            you.
          </p>
        </Container>
      </section>

      <section id="instructions" className="my-5">
        <Container>
          <h2>Instructions</h2>
          <Row>
            <Col md={6} lg={4} className="my-2">
              <Card className={styles.card}>
                <a href="#get-started" className="text-white">
                  <div
                    className={classnames("mt-2", styles.cardIcon, styles.one)}
                  >
                    <i className="bi bi-upload"></i>
                  </div>
                </a>
                <Card.Body className="text-center">
                  <Card.Title>Upload Data</Card.Title>
                  <Card.Text>
                    Start by uploading your .csv file containing student data.
                    For more information on what your file should look like on
                    upload, check out the{" "}
                    <Link href="documentation">documentation</Link>.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="my-2">
              <Card className={styles.card}>
                <div
                  className={classnames("mt-2", styles.cardIcon, styles.two)}
                >
                  <i className="bi bi-ui-checks"></i>
                </div>
                <Card.Body className="text-center">
                  <Card.Title>Provide Details</Card.Title>
                  <Card.Text>
                    You will be asked to provide a ranking of criteria and the
                    number of teams you would like to create. Adjust the
                    parameters to what best suits your needs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12} lg={4} className="my-2">
              <Card className={styles.card}>
                <div
                  className={classnames("mt-2", styles.cardIcon, styles.three)}
                >
                  <i className="bi bi-hand-thumbs-up"></i>
                </div>
                <Card.Body className="text-center">
                  <Card.Title>Get Results</Card.Title>
                  <Card.Text>
                    View and download the results. You can also restart the
                    process and try again with different data, team sizes, or
                    criteria.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section id="get-started" className="my-5">
        <Container>
          <h2>Get Started</h2>
          <Master />
        </Container>
      </section>

      <section id="faq" className="my-5">
        <Container>
          <h2>FAQ</h2>
          <Accordion className="mt-3">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <span className="fw-normal">
                  How long does the process take to complete?
                </span>
              </Accordion.Header>
              <Accordion.Body>
                Depending on the size of your data, this process could take
                anywhere from 4-10 minutes. Feel free to leave this window in
                the background while it's working.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span className="fw-normal">How does the algorithm work?</span>
              </Accordion.Header>
              <Accordion.Body>
                This program uses an approximation algorithm that iteratively
                improves on itself over time. Because it would be unfeasible to
                go through all of the possible groups and chose the best one,
                this approach drastically cuts down on the amount of time while
                still ensuring great results.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <span className="fw-normal">
                  Is any of my data stored or linked to me?
                </span>
              </Accordion.Header>
              <Accordion.Body>
                This program doesn't store or link any of your data. The results
                you get are also anonymous since running this program on the
                same data multiple times will always render a different result.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <span className="fw-normal">
                  What does my input file need to look like?
                </span>
              </Accordion.Header>
              <Accordion.Body>
                Your csv file needs to be UTF-8 encoded and can contain any
                number and order of columns outside of the ones outlined in the{" "}
                <Link href="documentation">documentation</Link>.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Container>
      </section>
    </Layout>
  );
}
