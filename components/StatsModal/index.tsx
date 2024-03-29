import Link from "next/link";
import React, { useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import config from "../../config";
import { setSnackbarItem } from "../../redux/actions/snackbar";
import { EPuzzleStatus } from "../../redux/enums/puzzleStatus";
import { IRootReducer } from "../../redux/reducers";
import { getPuzzleAttempts, getPuzzleStatus } from "../../redux/selectors/board";
import { getCurrentStreak, getGamesPlayed, getGamesWon, getMaxStreak } from "../../redux/selectors/stats";
import { ESymbolStatus } from "../GameBoard/enums/symbolStatus";
import Modal, { ModalProps } from "../Modal";
import Countdown from "./components/Countdown";
import moment from "moment";
import { GameTypeContext } from "../../common/context/gameTypeContext";

interface StatsModalProps extends ModalProps {}

const StatsModal : React.FC<StatsModalProps> = ({ ...props }) => {  
    const state = useSelector((state:IRootReducer) => state);
    
    const { type:gameType } = useContext(GameTypeContext);
    const puzzleStatus = getPuzzleStatus(state, gameType); 
       
    const dailyGameOver = useMemo(() => {
        return [ EPuzzleStatus.FAIL, EPuzzleStatus.WON ].includes(puzzleStatus as EPuzzleStatus);
    }, [ puzzleStatus ]);

    const gamesPlayed = getGamesPlayed(state);
    const gamesWon = getGamesWon(state);
    const currentStreak = getCurrentStreak(state);
    const maxStreak = getMaxStreak(state);

    const puzzleAttempts = getPuzzleAttempts(state);

    const dispatch = useDispatch();

    const winPercentage = useMemo(() => {
        if (gamesPlayed === 0) return 0;
        return Math.round((gamesWon / gamesPlayed) * 100);
    }, [ gamesWon, gamesPlayed ]);

    const handleShare = () => {
        let result = "";

        for (let i = 0; i < puzzleAttempts.length; i++){
            for (let j = 0; j < puzzleAttempts[i].length; j++) {
                const status =  puzzleAttempts[i][j].status

                switch (status) {
                    case ESymbolStatus.CORRECT: 
                        result += "🟩"; break; 
                    case ESymbolStatus.PARTIAL: 
                        result += "🟨"; break; 
                    case ESymbolStatus.INCORRECT: 
                        result += "🟥"; break; 
                    default: 
                        result += "⬛"; break; 
                }
            }
            result += "\n";
        }

        const date = moment().format("L");
        let message = `${puzzleStatus === EPuzzleStatus.WON ? "I Solved " : ""}Codle ${date}`;

        if (puzzleStatus === EPuzzleStatus.WON) {
            message += ` in ${puzzleAttempts.length}/${config.max_attempts} Attempts!`;
        } 

        message += `\n\n${result}`;

        if (navigator.share && navigator.share !== undefined) {
            navigator.share({
                title: 'Codle',
                text: message,
                // url: 'https://codle.mahitm.com',
              })
              .catch((error) => console.log('Error sharing', error));
          } else {
            navigator.clipboard.writeText(message)
                .then(() => {
                    dispatch(setSnackbarItem({ title: "Copied Results to Clipboard" }))
                }).catch(() => {
                    dispatch(setSnackbarItem({ title: "Failed to Copy Results to Clipboard!" }))
                });
        }
    };

    return (
        <Modal title="Statistics" { ...props }>
            <div className="w-full min-w-0 md:min-w-[275px] pt-5 px-10">
                <div className="flex justify-center text-center space-x-5 pb-6">
                    <div className="flex-col items-center">
                        <h1 className="text-white text-2xl">{ gamesPlayed || "0" }</h1>
                        <p className="text-white text-xs">Played</p>
                    </div>
                    <div className="flex-col items-center">
                        <h1 className="text-white text-2xl">{ winPercentage || "0" }</h1>
                        <p className="text-white text-xs">Win %</p>
                    </div>

                    <div className="flex-col items-center">
                        <h1 className="text-white text-2xl">{ currentStreak || "0" }</h1>
                        <p className="text-white text-xs">Current<br/>Streak</p>
                    </div>
                    <div className="flex-col items-center">
                        <h1 className="text-white text-2xl">{ maxStreak || "0" }</h1>
                        <p className="text-white text-xs">Max<br/>Streak</p>
                    </div>
                </div>
                {
                    dailyGameOver && (
                        <div className="p-5 pt-0 flex flex-col items-center space-y-5 justify-around">
                            <div className="mt-5 flex-col space-y-1 items-center">
                                <h2 className="text-md font-medium text-center capitalize text-gray-900 dark:text-white">
                                    Next Codle
                                </h2>          
                                <Countdown />
                            </div>
                            <button
                                aria-label="Share Codle"
                                name={`Share Codle`}
                                title={"Share"}
                                onClick={handleShare}
                                style={{ 
                                    cursor: "pointer",
                                }} 
                                className={`flex w-full px-5 py-3 relative transition-colors text-slate-900 text-1xl dark:text-white text-base font-semibold justify-center items-center bg-white dark:bg-slate-400 dark:md:hover:bg-slate-300 rounded-md overflow-hidden border border-black/5 dark:border-slate-500 flex-1 m-1 border-b-4 `}
                            >
                                <span className="z-10">
                                    <p>Share</p>
                                </span>
                            </button>
                        </div>
                    )
                }
                <p className="text-gray-400 m-1 text-sm mb-5 text-center">
                    Developed & Designed By<br/>
                    <Link href="https://github.com/MahitMehta" passHref>
                        <a 
                            className="hover:underline"
                            about="Mahit Mehta's Github Profile" 
                            target={"_blank"} 
                            rel="noreferrer noopener"
                        >
                            Mahit Mehta
                        </a>
                    </Link>
                    <span>&nbsp;and&nbsp;</span> 
                    <Link href="https://github.com/TheBlazingTorchic" passHref>
                        <a 
                            className="hover:underline"
                            about="Atharv's Github Profile" 
                            target={"_blank"} 
                            rel="noreferrer noopener"
                        >
                            Atharv
                        </a>
                    </Link>.
                </p>
            </div>
        </Modal>
    )
}

export default StatsModal;