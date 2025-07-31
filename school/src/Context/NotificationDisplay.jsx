import { useContext, useEffect } from "react";
import { ChatContext } from "./ChatContext";

const NotificationDisplay = () => {
    const { msg, from, setMsg, setFrom } = useContext(ChatContext);

    useEffect(()=>{
        console.log('got')
        if(msg){
            console.log('invoked')
            const timer = setTimeout(()=>{
                setMsg(null);
                setFrom(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [msg, from, setFrom, setMsg]);

    if(!msg)
        return null;

    return (
        <div className="notification" style={{ cursor: "pointer" }}>
            <span className="notify-from">{from}</span>
            <span className="notify-msg">{msg}</span>
        </div>
    );
};

export default NotificationDisplay;
