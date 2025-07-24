import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decryptRandom, encryptRandom } from "../../Security/Encryption";

export const LoginSuperAdmin = createAsyncThunk('login/LoginSuperAdmin',async(details,{rejectWithValue})=>{
    try{
        console.log(details)
        console.log(encryptRandom(JSON.stringify(details)))
        const response = await fetch('http://localhost:3000/super/loginSuperAdmin',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({details:encryptRandom(JSON.stringify(details))})
        })
        const data = await response.json()
        console.log(data)
        if(data.status === 'success')
            return {status: data.status}
        else
            return {message: data.message}
    }
    catch(err){
        console.log(err);
        return rejectWithValue('Something went wrong!');
    }
})

export const ValidateSuperAdmin = createAsyncThunk('login/ValidateSuperAdmin',async(token,{rejectWithValue})=>{
    try{
        console.log(token)
        const response = await fetch('http://localhost:3000/super/validateToken',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({token: encryptRandom(token)})
        })
        const data = await response.json();
        console.log(data)
        return data.status === 'success' ? {details: JSON.parse(decryptRandom(data.userDetails))} : rejectWithValue("Invalid")
    }
    catch(err){
        return rejectWithValue("Something went wrong!")
    }
})

export const LoginSlice = createSlice({
    name: 'login',
    initialState: {
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(LoginSuperAdmin.fulfilled, (state,action) => {
                state.error = null;
            })
            .addCase(LoginSuperAdmin.rejected, (state,action) => {
                state.error = action.payload;
            });
        builder
            .addCase(ValidateSuperAdmin.fulfilled, (state,action) => {
                state.error = null;
                sessionStorage.setItem('email',action.payload.details.email)
            })
            .addCase(ValidateSuperAdmin.rejected, (state,action) => {
                state.error = action.payload;
            })
    }
})

export default LoginSlice.reducer