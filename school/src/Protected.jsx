import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ValidateStudent } from "./slices/Login/LoginStudentSlice";
import { useDispatch } from "react-redux";

const Protected = () => {
    const dispatch = useDispatch();
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const doFirst = async () => {
            const token = sessionStorage.getItem("token");
            if(token){
                try{
                    const userDetails = await dispatch(ValidateStudent(token)).unwrap();
                    if(userDetails === "Invalid" || userDetails === "Something went wrong!"){
                        console.log(userDetails);
                        sessionStorage.removeItem("token");
                        sessionStorage.removeItem("email");
                        alert("Session Expired! Please Login again to continue!");
                        setVerified(false);
                    }
                    else{
                        console.log("Hello");
                        setVerified(true);
                    }
                }
                catch(err){
                    alert("Session Expired! Please Login again to continue!");
                    sessionStorage.removeItem("email");
                    sessionStorage.removeItem("token");
                    setVerified(false);
                }
            }
            else{
                alert("Login First to Continue");
                setVerified(false);
            }
            setLoading(false);
        };
        doFirst();
    },[dispatch]);

    if(loading)
        return null;

    return verified ? <Outlet /> : <Navigate to="/" />;
};

export default Protected;