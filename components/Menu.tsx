import css from "./Menu.module.css";

type Props = {
  onSelect: (n: number) => void;
};

export default function Menu({ onSelect }: Props) {
  return (
    <nav className={css.menu}>
      {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
        <button key={n} onClick={() => onSelect(n)} className={css.item}>
          Вправи. Таблиця ділення на {n}
        </button>
      ))}
    </nav>
  );
}
