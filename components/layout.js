import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import styles from '../styles/Layout.module.css'


export default function Layout({ children }) {
  return (
    <>    
      <Navbar expand='lg'>
        <Container>
          <Navbar.Brand >UC Berkeley Haas</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav' className='justify-content-end'>
            <Nav>
              <Nav.Item>
                <Link href='/' passHref legacyBehavior>
                  <Nav.Link>Home</Nav.Link>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link href='#about' passHref legacyBehavior>
                  <Nav.Link>About</Nav.Link>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link href='#instructions' passHref legacyBehavior>
                  <Nav.Link>Instructions</Nav.Link>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link href='#get-started' passHref legacyBehavior>
                  <Nav.Link>Get Started</Nav.Link>
                </Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>{children}</main>

      <footer className={styles.footer}>
        <Container className={styles.footer}>
          <p>Project for UC Berkeley MBA for Executives Program | email@example.com</p>
          <p>Made by Emmanuel Cobian Duarte</p>
        </Container>
      </footer>
    </>
  )
}
