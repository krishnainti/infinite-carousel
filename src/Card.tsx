import { ReactElement } from "react";
import styles from "./Card.module.scss";

const Card = ({ text }: { text: string }): ReactElement => {
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardContainer}>
        <div className={styles.cardBody}>{text}</div>
      </div>
    </div>
  );
};

export default Card;
