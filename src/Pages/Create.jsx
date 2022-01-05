import React, { useContext, useEffect, useState } from 'react'
import Button from '../Components/Button'
import Container from '../Components/Container'
import Input from '../Components/Input'
import Link from '../Components/Link'
import RandomAvatar from '../Components/RandomAvatar'
import { toast } from 'react-toastify';
import { createGame } from '../Helpers/create-game'
import { GameContext } from '../Helpers/game'
import Nav from '../Helpers/Nav'
import { useNavigate } from 'react-router'
import copy from 'copy-to-clipboard'

export default function Create() {
    const gameInstance = useContext(GameContext)
    const socket = gameInstance.socket
    const [maxPlayers, setMaxPlayers] = useState("")
    const [timeAprox, setTimeAprox] = useState()
    const [playerName, setPlayerName] = useState("")
    const navigate = useNavigate()
    const SettingsContainer = (props) => {
        return (
            <div style={{ flex: 1, paddingRight: 10, lineHeight: 1.2 }}>
                {props.children}
            </div>
        )
    }
    useEffect(() => {
        socket.on("create-game", (responce) => {
            if (responce.error) {
                toast.success(responce.msg, {
                    icon: "❗"
                })
            } else {
                copy(responce.data)
                setTimeout(() => {
                    toast.dismiss()
                    setTimeout(() => {
                        toast.success("Code copied!", {
                            icon: "✔️",
                            hideProgressBar: true
                        })
                        Nav(navigate, `/lobby/${responce.data}`)
                    }, 500)
                }, 1000)
            }
        })
        document.getElementById("create-maxPlayers").focus()
    }, [])
    useEffect(() => {
        document.getElementById("create-rounds").focus()
    }, [timeAprox])
    useEffect(() => {
        document.getElementById("create-maxPlayers").focus()
    }, [maxPlayers])
    useEffect(() => {
        document.getElementById("create-name").focus()
    }, [playerName])
    return (
        <Container flex fill fdc aifs>
            <div style={{ padding: 50, paddingLeft: 0, height: "fit-content", gap: 30, fontSize: 30, lineHeight: 1.2 }} className='flex aic jcc'>
                <RandomAvatar regen />
                New Lobby
            </div>
            <div style={{ width: "100%", height: "100%", position: "relative" }} className='flex aic jcc fdc'>
                <div className='flex jcsb' style={{ padding: "0px", position: "relative", width: "100%", height: "80%" }}>
                    <SettingsContainer>
                        <h2>Game <br /> Settings</h2>
                        <br />
                        <br />
                        <Input value={maxPlayers} onChange={(e) => { setMaxPlayers(e.target.value) }} type="number" id="create-maxPlayers" placeholder="Max Players" />
                        <br />
                        <Input value={timeAprox} onChange={(e) => { setTimeAprox(e.target.value) }} type="number" id="create-rounds" placeholder="Rounds" />
                        <p id="createTimeAprox">About: {((parseInt(timeAprox) * 3) > 120 ? "> 2" : parseInt(timeAprox) * 3) || 0}  {(parseInt(timeAprox) * 3) > 120 ? "hours" : "minutes"}</p>
                    </SettingsContainer>
                    <SettingsContainer>
                        <h2>Your <br /> Settings</h2>
                        <br />
                        <br />
                        <Input value={playerName} onChange={(e) => { setPlayerName(e.target.value) }} id="create-name" placeholder="Name" />
                    </SettingsContainer>
                    <div className="playGuide flex aic jcc fdc">
                        <div style={{ width: "100%", textAlign: "center" }}>
                            How to play
                        </div>
                        <ul>
                            <li>Share your code</li>
                            <li>Give people time to join the lobby</li>
                            <li>Start the game!</li>
                            <li>You'll be able to play too</li>
                        </ul>
                    </div>
                </div>
                <div className='flex aic jcc' style={{ gap: 20 }}>
                    <Button onClick={() => {
                        createGame("create-maxPlayers", "create-rounds", "create-name", gameInstance.avatar, socket)
                    }}>
                        Create Game
                    </Button>
                    <Button onClick={() => {
                        createGame("10", "1", "Ethan", gameInstance.avatar, socket, true)
                    }}>
                        Test Game
                    </Button>
                </div>
                <p style={{ fontSize: 12, marginTop: 5 }}>or <Link go="/">join game</Link></p>

            </div>
        </Container>
    )
}
