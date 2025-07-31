import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { assets } from '../assets/assets'

const NotificationDisplay = () => {
    const { msg, from, setMsg, setFrom } = useContext(ChatContext);
    const notificationRef = useRef(null)

    useEffect(()=>{
        console.log('got')
        if(msg){
            console.log('invoked')
            notificationRef.current.play()
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
            <audio src={assets.Notification} ref={notificationRef}/>
        </div>
    );
};

export default NotificationDisplay;

