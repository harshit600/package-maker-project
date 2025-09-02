import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async () => {
    const response = await fetch("/user-profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth method
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    return await response.json();
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    status: "idle",
    error: null,
  },
  reducers: {
    signOut(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload; // Store user data in state
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { signOut } = userSlice.actions;
export default userSlice.reducer;
