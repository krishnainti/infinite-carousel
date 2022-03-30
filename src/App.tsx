import { ReactElement } from "react";
import styles from "./App.module.scss";
import Carousel from "./Carousel";
import Card from "./Card";

const cards = ["Card1", "Card2", "Card3", "Card4", "Card5"];

function App(): ReactElement {
  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <Carousel>
          {cards.map((text, index) => {
            return <Card key={index} text={text} />;
          })}
        </Carousel>
      </div>
    </div>
  );
}

export default App;
