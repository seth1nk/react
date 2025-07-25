import meter1 from "../assets/img/meter1.svg";
import meter2 from "../assets/img/meter2.svg";
import meter3 from "../assets/img/meter3.svg";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import arrow1 from "../assets/img/arrow1.svg";
import arrow2 from "../assets/img/arrow2.svg";
import colorSharp from "../assets/img/color-sharp.png";

export const Skills = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <section className="skill" id="skills">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="skill-bx wow zoomIn">
              <h2>Навыки</h2>
              <p>
                Здесь представлены мои ключевые навыки, которые я развил в процессе обучения в университете и работы над учебными проектами.<br />
                Эти навыки помогают мне успешно справляться с задачами веб-разработки, дизайна и анализа данных.
              </p>
              <Carousel responsive={responsive} infinite={true} className="owl-carousel owl-theme skill-slider">
                <div className="item">
                  <img src={meter1} alt="Иконка навыка" />
                  <h5>Веб-разработка</h5>
                </div>
                <div className="item">
                  <img src={meter2} alt="Иконка навыка" />
                  <h5>Дизайн интерфейсов</h5>
                </div>
                <div className="item">
                  <img src={meter3} alt="Иконка навыка" />
                  <h5>Анализ данных</h5>
                </div>
                <div className="item">
                  <img src={meter1} alt="Иконка навыка" />
                  <h5>Программирование на JavaScript</h5>
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
      <img className="background-image-left" src={colorSharp} alt="Фон" />
    </section>
  );
};