import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decryptRandom, encryptRandom } from "../../Security/Encryption";

export const LoginGradeAdmin = createAsyncThunk('loginGrade/LoginGradeAdmin',async(details,{rejectWithValue})=>{
    try{
        console.log(details)
        console.log(encryptRandom(JSON.stringify(details)))
        const response = await fetch('http://localhost:3000/grade/login',{
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

export const ValidateGradeAdmin = createAsyncThunk('loginGrade/ValidateGradeAdmin',async(token,{rejectWithValue})=>{
    try{
        console.log(token)
        const response = await fetch('http://localhost:3000/grade/validateToken',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({token: encryptRandom(token)})
        })
        const data = await response.json();
        console.log(data)
        console.log(data.status==='success'?'Validated':'Not Validated')
        return data.status === 'success' ? {details: JSON.parse(decryptRandom(data.userDetails))} : rejectWithValue("Invalid")
    }
    catch(err){
        return rejectWithValue("Something went wrong!")
    }
})

export const LoginGradeSlice = createSlice({
    name: 'loginGrade',
    initialState: {
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(LoginGradeAdmin.fulfilled, (state,action) => {
                state.error = null;
            })
            .addCase(LoginGradeAdmin.rejected, (state,action) => {
                state.error = action.payload;
            });
        builder
            .addCase(ValidateGradeAdmin.fulfilled, (state,action) => {
                state.error = null;
                sessionStorage.setItem('email',action.payload.details.email)
            })
            .addCase(ValidateGradeAdmin.rejected, (state,action) => {
                state.error = action.payload;
            })
    }
})

export default LoginGradeSlice.reducer