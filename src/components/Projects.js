import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import projImg1 from "../assets/img/project-img1.png"; // Изображение студенческого проекта 1
import projImg2 from "../assets/img/project-img2.png"; // Изображение студенческого проекта 2
import projImg3 from "../assets/img/project-img3.png"; // Изображение студенческого проекта 3
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Projects = () => {
  const projects = [
    {
      title: "Курсовой проект",
      description: "Разработка веб-приложения",
      imgUrl: projImg1,
    },
    {
      title: "Учебный стартап",
      description: "Дизайн и программирование",
      imgUrl: projImg2,
    },
    {
      title: "Исследовательская работа",
      description: "Анализ данных и визуализация",
      imgUrl: projImg3,
    },
  ];

  return (
    <section className="project" id="projects">
      <Container>
        <Row>
          <Col size={8}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <h2>Мои проекты</h2>
                  <p>
                    Здесь представлены мои учебные и личные проекты, выполненные в рамках
                    университетских курсов и самостоятельных инициатив. Каждый проект демонстрирует
                    навыки программирования, дизайна и анализа данных.
                  </p>
                  <Tab.Container id="projects-tabs" defaultActiveKey="first">
                    <Nav
                      variant="pills"
                      className="nav-pills mb-5 justify-content-center align-items-center"
                      id="pills-tab"
                    >
                      <Nav.Item>
                        <Nav.Link eventKey="first">Курсовые</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="second">Самостоятельные</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="third">Командные</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content
                      id="slideInUp"
                      className={isVisible ? "animate__animated animate__slideInUp" : ""}
                    >
                      <Tab.Pane eventKey="first">
                        <Row>
                          {projects.map((project, index) => (
                            <ProjectCard key={index} {...project} />
                          ))}
                        </Row>
                      </Tab.Pane>
                      <Tab.Pane eventKey="second">
                        <p>
                          Здесь находятся мои самостоятельные проекты, созданные для углубления
                          знаний в веб-разработке и дизайне интерфейсов.
                        </p>
                      </Tab.Pane>
                      <Tab.Pane eventKey="third">
                        <p>
                          Командные проекты, выполненные в рамках хакатонов и учебных коллабораций,
                          демонстрируют мои навыки работы в группе.
                        </p>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              )}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="Фон" />
    </section>
  );
};