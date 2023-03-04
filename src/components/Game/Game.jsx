import {useEffect, useMemo, useState} from "react";
import style from "./Game.module.css";

const Bomb = "B";

function createTable(size) {
    const value: [] = new Array(size * size).fill(0);

    function plusOne(x, y) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            if (value[y * size + x] === Bomb) return;

            value[y * size + x] += 1;

        }
    }

    for (let i = 0; i < 40;) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);

        if (value[y * size + x] === Bomb) continue;

        value[y * size + x] = Bomb;

        i += 1;

        plusOne(x + 1, y);
        plusOne(x - 1, y);
        plusOne(x, y + 1);
        plusOne(x, y - 1);
        plusOne(x + 1, y - 1);
        plusOne(x - 1, y + 1);
        plusOne(x - 1, y - 1);
        plusOne(x + 1, y + 1);
    }

    return value;
}

const Veils = {
    Transparent: null,
    Fill: "",
    Flag: "🏴",
    Question: "?"
}

function Game(props) {
    const size = 16;
    const dimension = Array(size).fill(0);
    const clearing = [];
    const [value, setValue] = useState(() => createTable(size));
    const [veil, setVeil] = useState(() => new Array(size * size).fill(Veils.Fill));
    const [fail, setFail] = useState(false);
    const [lag, setLag] = useState(false);
    const [time, setTime] = useState(0);
    const [count, setCount] = useState(40);
    const [running, setRunning] = useState(false);

    const victory = useMemo(() => !value.some(
        (f, i) =>
            f === Bomb && veil[i] !== Veils.Transparent && veil[i] !== Veils.Flag), [value, veil]);

    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 10);
            }, 10);
        } else if (!running) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [running]);

    useEffect(() => {
        if (victory) {
            setRunning(false);
        }
    }, [running, victory]);

    function counter() {
        for (let i = 1; i < size*size; ) {
            if (veil[i] === Veils.Flag) {
                setCount(count-1);
            }

            i++;
        }
    }

    function clear(x, y) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            if (veil[y * size + x] === Veils.Transparent) return;

            clearing.push([x, y]);
        }
    }

    function clickEvent(x, y) {
        setRunning(true);
        if (veil[y * size + x] === Veils.Transparent) return;

        clear(x, y);

        while (clearing.length) {
            const [x, y] = clearing.pop();
            veil[y * size + x] = Veils.Transparent;

            if (value[y * size + x] !== 0) continue;

            clear(x + 1, y);
            clear(x - 1, y);
            clear(x, y + 1);
            clear(x, y - 1);

        }

        /*function firstClick() {
            if (veil.every === Veils.Fill) {
                window.location.reload();
            }
        }*/

        if (value[y * size + x] === Bomb) {
            veil.every((element) => {
                if (element === Veils.Transparent
                    && veil.some === Veils.Fill) {
                    window.location.reload();
                }
                veil.forEach((_, i) => veil[i] = Veils.Transparent);})


            setFail(true);
            setRunning(false);
        }

        setVeil((prev) => [...prev]);
    }

    function contextEvent(e, x, y) {
        setRunning(true);
        e.preventDefault();
        e.stopPropagation();

        if (veil[y * size + x] === Veils.Transparent) return;

        if (veil[y * size + x] === Veils.Fill) {
            veil[y * size + x] = Veils.Flag;
        }
        else if (veil[y * size + x] === Veils.Flag) {
            veil[y * size + x] = Veils.Question;
        }
        else if (veil[y * size + x] === Veils.Question) {
            veil[y * size + x] = Veils.Fill;
        }

        setVeil((prev) => [...prev]);

        counter();
    }

    return (
        <div className={style.container}>
            <div className={style.up}>
                <div>
                    Количетво мин: {count}
                </div>
                <div className={style.timer}>
                    <div>
                        <button onClick={() =>
                            window.location.reload()}>{fail ? "😩" : victory ? "😎" : lag ? "😨" : "🙂"}
                        </button>
                    </div>
                    <div className={style.second}>
                        Секундомер:
                        <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
                        <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
                    </div>
                </div>
            </div>
            <div>
                {dimension.map((_, y) => {
                    return (
                        <div key={y} className={style.table}>
                            {dimension.map((_, x) => {
                                return (
                                    <div key={x} style={{
                                        backgroundColor: fail ? "#faa" : victory ? "#ffb" : "#b6b2b1"
                                    }}
                                         className={style.tableStyle}
                                         onClick={() => clickEvent(x, y)}
                                         onContextMenu={(e) => contextEvent(e, x, y)}
                                         onMouseDown={() => setLag(true)}
                                         onMouseUp={() => setLag(false)}
                                    >
                                        {veil[y * size + x] !== Veils.Transparent
                                            ? veil[y * size + x]
                                            : value[y * size + x] === Bomb
                                                ? "💣"
                                                : value[y * size + x]}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Game;