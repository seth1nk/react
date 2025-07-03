import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import logo from '../assets/img/logo.svg';

const NavBar = ({ onLoginShow, onRegisterShow, isAuthenticated, user, onLogout }) => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    console.log('NavBar.js: Props:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onUpdateActiveLink = (value) => {
    setActiveLink(value);
  };

  return (
    <Navbar expand="md" className={scrolled ? 'scrolled' : ''}>
      <Container>
        <Navbar.Brand href="/">
          <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto' }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              href="#home"
              className={activeLink === 'home' ? 'active navbar-link' : 'navbar-link'}
              onClick={() => onUpdateActiveLink('home')}
            >
              Главная
            </Nav.Link>
            <Nav.Link
              href="#skills"
              className={activeLink === 'skills' ? 'active navbar-link' : 'navbar-link'}
              onClick={() => onUpdateActiveLink('skills')}
            >
              Навыки
            </Nav.Link>
            <Nav.Link
              href="#projects"
              className={activeLink === 'projects' ? 'active navbar-link' : 'navbar-link'}
              onClick={() => onUpdateActiveLink('projects')}
            >
              Проекты
            </Nav.Link>
          </Nav>
          <span className="navbar-text">
            {isAuthenticated && user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px' }}>
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={`${user.name || 'User'} avatar`}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '1px solid #fff',
                        marginRight: '10px',
                      }}
                    />
                  )}
                  <span>{user.name || 'User'}</span>
                </div>
                <button className="vvd" onClick={onLogout}>
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <>
                <button className="vvd" onClick={onLoginShow}>
                  <span>Войти</span>
                </button>
                <button className="vvd" onClick={onRegisterShow}>
                  <span>Регистрация</span>
                </button>
              </>
            )}
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
