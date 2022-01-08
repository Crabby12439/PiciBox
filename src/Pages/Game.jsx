import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { GameContext } from '../Helpers/game'
import Zoom from 'react-reveal/Zoom'
import Fade from 'react-reveal/Fade'
import { toast } from "react-toastify";
import Nav from "../Helpers/Nav";
import { useNavigate } from "react-router";
import RandomAvatar from "../Components/RandomAvatar";
import Connecting from '../Components/Connecting';
import Button from '../Components/Button';
import Container from '../Components/Container';
import Review from './Review';
import spinner from "../img/other/spinner.gif"
import Lobby from '../Components/Lobby';

export default function Game() {
    const navigate = useNavigate()
    const { code } = useParams()
    const gameInstance = useContext(GameContext)
    const socket = gameInstance.socket
    const [prompt, setPrompt] = useState(null)
    const [lobby, setLobby] = useState(null)
    const [owner, setOwner] = useState(false)
    const [stage, setStage] = useState(1)
    const [reviewData, setReviewData] = useState(null)
    const [submitedAnswer, setSubmitedAnswer] = useState(false)
    useEffect(() => {
        socket.emit("get-lobby", {
            code: code
        })
        socket.on("get-lobby", (responce) => {
            if (responce.error) {
                toast.success(responce.msg, {
                    icon: "❗"
                })
            } else {
                for (let i = 0; i < responce.data.length; i++) {
                    if (responce.data[i].host) {
                        if (responce.data[i].id === socket.id) {
                            setOwner(true)
                        } else {
                            setOwner(false)
                        }
                    }
                }
                setLobby(responce.data)
            }
        })
        socket.on("new-prompt", (responce) => {
            console.log("Recceived new prompt")
            setStage(1)
            setPrompt(responce.data)
            // setPrompt(null)
            setSubmitedAnswer(false)
        })
        socket.on("end-game", (responce) => {
            toast.success(responce.data, {
                icon: "❌"
            })
            Nav(navigate, "/")
        })
        socket.on("init-round", (responce) => {
            if (responce.error) {
                toast.success(responce.msg, {
                    icon: "❗"
                })
            } else {
                setStage(2)
            }
        })
        socket.on("submit-answer", (responce) => {
            if (responce.error) {
                toast.success(responce.msg, {
                    icon: "❗"
                })
            } else {
                setSubmitedAnswer(true)
            }
        })
        socket.on("review-game", (responce) => {
            setStage(3)
            setReviewData(responce.data)
            console.log(responce.data)
        })
    }, [])
    const Players = () => {
        console.log("Loading players")
        console.log(lobby)
        const playersArray = new Array()
        for (let i = 0; i < lobby.length; i++) {
            playersArray.push(
                <div className="flex aic jcc fdc">
                    <RandomAvatar size={90} avatar={lobby[i].avatar} />
                    <p style={{ marginTop: 15 }}>{lobby[i].name}</p>
                </div>
            )
        }
        return (
            <div className="flex aic jcc" style={{ flexWrap: "wrap", gap: 20 }}>
                {playersArray}
            </div>
        )
    }
    const PromptComponent = (props) => {
        return (
            // <Fade>
            <div className="flex aic jcc fdc" style={{ gap: 20 }}>
                <div className="promptContainer flex aic jcc">
                    <div className='flex aic jcc' style={{ width: "100%", height: "100%", padding: 20 }}>
                        {prompt
                            ? <Fade><p>{prompt}</p></Fade>
                            : <Fade><img className='spinner' src={spinner} alt="Prompt loading" /></Fade>
                        }
                    </div>
                </div>
                {props.disableRefresh
                    ? null
                    : <div>
                        {owner
                            ? <Button onClick={() => {
                                setPrompt(null)
                                socket.emit("refresh-prompt", {
                                    code: code
                                })
                            }} col="#00B2FF" size={"icon"}>
                                🔃
                                {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg> */}
                            </Button>
                            : null
                        }
                    </div>
                }
            </div>
            // </Fade>
        )
    }
    if (lobby) {
        if (stage === 1) {
            return (
                <div className="flex aic jcsb fdc" style={{ height: "80%" }}>
                    <Fade>
                        <PromptComponent />
                    </Fade>
                    <br />
                    <div>
                        <Lobby lobby={lobby} />
                    </div>
                    <div style={{ position: "relative", top: 20 }}>
                        {owner
                            ? <Button size="large" onClick={() => {
                                if (prompt) {
                                    socket.emit("init-round", {
                                        code: code
                                    })
                                } else {
                                    toast.success("Wait for a prompt", {
                                        icon: "⚙️"
                                    })
                                }
                            }}>Begin round</Button>
                            : "Waiting to start..."
                        }
                    </div>
                </div>
            )
        } else if (stage === 2) {
            if (submitedAnswer) {
                return (
                    <Zoom>
                        <Container flex aic jcc full fdc>
                            <h1>You've submitted your responce!</h1>
                            <br />
                            <h5>Wait for the others to finish</h5>
                        </Container>
                    </Zoom>
                )
            } else {
                return (
                    <div className="flex aic jcsb fdc" style={{ height: "100%", gap: 20 }}>
                        <div>
                            <PromptComponent disableRefresh />
                        </div>
                        <div className="flex aic jcc fdc">
                            <div contentEditable id="prompt-editor" className="textarea"></div>
                            <Button size="small" onClick={() => {
                                console.log("Emmiting socket call")
                                const el = document.getElementById("prompt-editor").textContent
                                if (el) {
                                    const caseConvertedEl = el.toLowerCase()
                                    if (caseConvertedEl.includes("ur mom") || caseConvertedEl.includes("your mom") || caseConvertedEl.includes("ur mum") || caseConvertedEl.includes("your mum")) {
                                        toast.success(`No "ur mum" jokes!`, {
                                            icon: "🚨"
                                        })
                                    } else {
                                        socket.emit("submit-answer", {
                                            code: code,
                                            answer: el
                                        })
                                    }
                                } else {
                                    toast.success("Must fill in the box!", {
                                        icon: "❌"
                                    })
                                }
                            }}>Submit</Button>
                        </div>
                        <div>
                            <Players />
                        </div>
                    </div>
                )
            }
        } else if (stage === 3) {
            return (
                <div>
                    <Review code={code} lobby={lobby} reviewData={reviewData} />
                </div>
            )
        }
    } else {
        return <Connecting />
    }
}
