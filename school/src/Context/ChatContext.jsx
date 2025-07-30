import { createContext, useState } from "react";

export const ChatContext = createContext()

export const ChatProvider = ({children}) => {
    const [socketConn,setSocketConn] = useState(null)
    const [msg, setMsg] = useState(null);
    const [from, setFrom] = useState(null);
    const notify = (msg,from) => {
        setMsg(msg);
        setFrom(from);
    }

    return (
        <ChatContext.Provider value={{socketConn,setSocketConn,msg,setMsg,from,setFrom,notify}}>
            {children}
        </ChatContext.Provider>
    )
}