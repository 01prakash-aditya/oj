import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    currentUser: null,
    loading: false,
    error: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
            state.error = false;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateUserStart: (state) => {
            state.loading = true;
        },
        updateUserSuccess: (state, action) => {
            state.currentUser = action.payload; 
            state.loading = false;
            state.error = false;
        },
        updateUserFailure: (state, action) =>
        {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) => {
            state.loading = true;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = false;
        },
        deleteUserFailure: (state, action) =>
        {
            state.loading = false;
            state.error = action.payload;
        },
        SignOut: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = false;
        },
    }
});

export const { loginStart, loginSuccess, loginFailure, updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, SignOut } = userSlice.actions;

export default userSlice.reducer;