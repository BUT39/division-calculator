"use client";

import { useEffect, useState } from "react";
import css from "./Trainer.module.css";

const TOTAL = 10; // кількість прикладів
const MAX_LEN = 2; // максимум цифр у відповіді
const FULL_BAR = 20; // секунд, за які смужка заповнюється повністю
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

type Task = { dividend: number; answer: number };
type Status = "idle" | "playing" | "done";
type Last = { kind: "right" | "wrong" | "missed"; task: Task };

function makeTasks(n: number): Task[] {
  return Array.from({ length: TOTAL }, () => {
    const answer = Math.floor(Math.random() * 10) + 1;
    return { dividend: n * answer, answer };
  });
}

// бали залежать від витраченого часу
function getPoints(ms: number): number {
  const s = ms / 1000;
  if (s < 10) return 10;
  if (s < 15) return 9;
  if (s < 20) return 8;
  return 7;
}

function getColor(ms: number): string {
  const s = ms / 1000;
  if (s < 10) return "green";
  if (s < 15) return "yellow";
  if (s < 20) return "orange";
  return "red";
}

export default function Trainer({ n }: { n: number }) {
  const [tab, setTab] = useState<"exercises" | "info">("exercises");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0); // мс з початку приклада
  const [last, setLast] = useState<Last | null>(null);

  const task = tasks[index];

  const start = () => {
    setTasks(makeTasks(n));
    setIndex(0);
    setValue("");
    setScore(0);
    setLast(null);
    setElapsed(0);
    setStatus("playing");
  };

  const pressDigit = (digit: string) => {
    setValue((v) => (v.length < MAX_LEN ? v + digit : v));
  };

  const backspace = () => setValue((v) => v.slice(0, -1));

  // «Наступний приклад»: перевіряємо відповідь і переходимо далі
  const handleNext = () => {
    if (status !== "playing") return;

    if (value === "") {
      setLast({ kind: "missed", task });
    } else if (Number(value) === task.answer) {
      setScore((s) => s + getPoints(elapsed));
      setLast({ kind: "right", task });
    } else {
      setLast({ kind: "wrong", task });
    }

    if (index + 1 >= TOTAL) {
      setStatus("done");
    } else {
      setIndex((i) => i + 1);
      setValue("");
      setElapsed(0);
    }
  };

  // таймер рахує час, який минув на поточному прикладі
  useEffect(() => {
    if (status !== "playing") return;
    const startedAt = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [status, index]);

  // цифрові клавіші на клавіатурі комп'ютера
  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        setValue((v) => (v.length < MAX_LEN ? v + e.key : v));
      } else if (e.key === "Backspace") {
        setValue((v) => v.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  const answered = status === "idle" ? 0 : status === "done" ? TOTAL : index;
  const percent = Math.min(elapsed / (FULL_BAR * 1000), 1) * 100;

  const lastTitle =
    last?.kind === "right"
      ? "Вірно:"
      : last?.kind === "wrong"
        ? "Не вірно:"
        : "Пропущено:";

  return (
    <section>
      <div className={css.tabs}>
        <button
          className={tab === "exercises" ? css.tabActive : css.tab}
          onClick={() => setTab("exercises")}
        >
          Вправи
        </button>
        <button
          className={tab === "info" ? css.tabActive : css.tab}
          onClick={() => setTab("info")}
        >
          Інструкція
        </button>
      </div>

      <div className={css.card}>
        {tab === "info" ? (
          <div className={css.instr}>
            <p>
              <b>Інструкція до вправ ділення натуральних чисел на {n}</b>
            </p>
            <ol>
              <li>Завдання складається із {TOTAL} прикладів</li>
              <li>
                Щоб розпочати виконання завдань, натисніть кнопку{" "}
                <span className={css.btnLike}>Почати вправу</span>
              </li>
              <li>
                Щоб ввести відповідь, використовуйте клавіатуру
                <div className={`${css.keypad} ${css.demoKeypad}`}>
                  {KEYS.map((k) => (
                    <button key={k} type="button" tabIndex={-1}>
                      {k}
                    </button>
                  ))}
                  <button type="button" tabIndex={-1} className={css.back}>
                    ⌫
                  </button>
                </div>
                або цифрові клавіші на ноутбуці/комп&apos;ютері
              </li>
              <li>
                Введіть відповідь і натисніть{" "}
                <span className={css.btnLike}>Наступний приклад</span>
                <p>
                  <b>Увага!!!</b> При переході до нового завдання ви не зможете
                  повернутися до попереднього, щоб змінити його значення!
                </p>
              </li>
              <li>
                Згенерується наступне завдання. Також ліворуч від клавіатури ви
                зможете побачити, чи правильно ви вирішили попереднє завдання, і
                набрані бали
              </li>
              <li>
                За правильно вирішене завдання ви отримаєте:
                <ul>
                  <li>
                    10 балів, якщо ви витратили на рішення менше 10 секунд
                    (індикатор зелений{" "}
                    <span
                      className={css.square}
                      style={{ background: "green" }}
                    />
                    )
                  </li>
                  <li>
                    9 балів, якщо ви витратили на рішення 10 – 15 секунд
                    (індикатор жовтий{" "}
                    <span
                      className={css.square}
                      style={{ background: "yellow" }}
                    />
                    )
                  </li>
                  <li>
                    8 балів, якщо ви витратили на рішення 15 – 20 секунд
                    (індикатор помаранчевий{" "}
                    <span
                      className={css.square}
                      style={{ background: "orange" }}
                    />
                    )
                  </li>
                  <li>
                    7 балів, якщо ви витратили на рішення більше 20 секунд
                    (червоний індикатор{" "}
                    <span
                      className={css.square}
                      style={{ background: "red" }}
                    />
                    )
                  </li>
                </ul>
              </li>
              <li>
                Після виконання {TOTAL} завдань ви побачите свій результат
              </li>
              <li>
                Можете спробувати покращити результат, натиснувши кнопку{" "}
                <span className={css.btnLike}>Пройти тест ще раз</span>
              </li>
            </ol>
          </div>
        ) : (
          <>
            <p className={css.title}>
              <b>Вправа.</b> Знайдіть значення частки:
            </p>

            <div className={css.task}>
              {status === "done" ? (
                <span>
                  Ваш результат: {score} з {TOTAL * 10} балів
                </span>
              ) : (
                <>
                  <span>{status === "idle" ? "?" : task.dividend}</span>
                  <span>:</span>
                  <span>{n}</span>
                  <span>=</span>
                  <span className={css.answer}>{value || "?"}</span>
                </>
              )}
            </div>

            <div className={css.bottom}>
              <div className={css.info}>
                <div className={css.timer}>
                  <div
                    className={css.timerFill}
                    style={{
                      width: `${percent}%`,
                      background: getColor(elapsed),
                    }}
                  />
                </div>
                <p>
                  Вправи: <span className={css.blue}>{answered}</span> з{" "}
                  <span className={css.red}>
                    {status === "idle" ? 0 : TOTAL}
                  </span>
                </p>
                <p>
                  Результат: <span className={css.blue}>{score}</span> балів
                </p>
                {last && (
                  <p>
                    <span
                      className={last.kind === "right" ? css.blue : css.red}
                    >
                      {lastTitle}
                    </span>
                    <span className={`${css.blue} ${css.equation}`}>
                      {last.task.dividend} : {n} = {last.task.answer}
                    </span>
                  </p>
                )}
              </div>

              <div className={css.keypad}>
                {KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => pressDigit(k)}
                    disabled={status !== "playing"}
                  >
                    {k}
                  </button>
                ))}
                <button
                  className={css.back}
                  onClick={backspace}
                  disabled={status !== "playing"}
                >
                  ⌫
                </button>
              </div>
            </div>

            <div className={css.startRow}>
              {status === "playing" ? (
                <button onClick={handleNext}>Наступний приклад</button>
              ) : (
                <button onClick={start}>
                  {status === "idle" ? "Почати вправу" : "Пройти тест ще раз"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
